import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const INITIAL_STATE = {
  name: '',
  type: 'custom',
  hp: 10,
  ac: 10,
  dexterity: 10,
  cr: '1',
  size: 'Medium',
  alignment: 'neutral',
  speed: '30 ft',
  str: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

const MonsterCreatorModal = ({ isOpen, onClose, onMonsterCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [specialAbilities, setSpecialAbilities] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numberFields = ['hp', 'ac', 'dexterity', 'str', 'con', 'int', 'wis', 'cha'];
    setFormData(prev => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('Debes iniciar sesión para crear monstruos.');

      const newMonster = {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        size: formData.size,
        alignment: formData.alignment,
        speed: formData.speed,
        hp: formData.hp,
        ac: formData.ac,
        dexterity: formData.dexterity,
        cr: formData.cr,
        stats: {
          str: formData.str,
          dex: formData.dexterity,
          con: formData.con,
          int: formData.int,
          wis: formData.wis,
          cha: formData.cha
        },
        special_abilities: specialAbilities.filter(sa => sa.name.trim() !== ''),
        actions: actions.filter(act => act.name.trim() !== '')
      };

      let monsterData;

      if (user.isAnonymous) {
        // Guardar localmente
        const id = 'local_' + Date.now();
        monsterData = {
          id,
          ...newMonster
        };
        const localSaved = JSON.parse(localStorage.getItem("dm_custom_monsters")) || [];
        localSaved.push(monsterData);
        localStorage.setItem("dm_custom_monsters", JSON.stringify(localSaved));
      } else {
        // Guardar en Firestore
        const docRef = doc(collection(db, 'custom_monsters'));
        monsterData = {
          id: docRef.id,
          ...newMonster
        };
        await setDoc(docRef, monsterData);
      }

      onMonsterCreated(monsterData); 
      onClose();
      // Resetear estados
      setFormData(INITIAL_STATE);
      setSpecialAbilities([]);
      setActions([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-yellow-500 font-fantasy tracking-wide">🛠️ Crear Monstruo Custom</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✖</button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow custom-scrollbar flex flex-col gap-4">
          {error && <div className="text-red-400 text-sm bg-red-900/20 p-2 border border-red-500 rounded">{error}</div>}
          {user?.isAnonymous && (
            <div className="text-amber-300 text-xs bg-amber-950/20 p-2 border border-amber-800 rounded">
              ⚠️ Estás como <strong>Invitado</strong>. Tus monstruos personalizados se guardarán en tu navegador (LocalStorage).
            </div>
          )}
          
          <form id="monster-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Nombre</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none text-sm" placeholder="Ej: Rey Goblin" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Tamaño</label>
                <select name="size" value={formData.size} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none text-sm">
                  <option value="Tiny">Diminuto (Tiny)</option>
                  <option value="Small">Pequeño (Small)</option>
                  <option value="Medium">Mediano (Medium)</option>
                  <option value="Large">Grande (Large)</option>
                  <option value="Huge">Enorme (Huge)</option>
                  <option value="Gargantuan">Gargantuesco (Gargantuan)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Alineamiento</label>
                <input type="text" name="alignment" value={formData.alignment} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none text-sm" placeholder="Ej: neutral, caótico malvado" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Velocidad</label>
                <input type="text" name="speed" value={formData.speed} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none text-sm" placeholder="Ej: 30 ft, vuelo 60 ft" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Tipo</label>
                <input type="text" name="type" value={formData.type} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none text-sm" placeholder="Ej: bestia, humanoide..." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">HP (Vida Máx)</label>
                <input required type="number" name="hp" value={formData.hp} onChange={handleChange} min="1"
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">CA (Armadura)</label>
                <input required type="number" name="ac" value={formData.ac} onChange={handleChange} min="1"
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Desafío (CR)</label>
                <input required type="text" name="cr" value={formData.cr} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none text-sm" placeholder="Ej: 1/4, 2, 5" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-2 border-b border-gray-700 pb-1">Atributos (1 - 30)</label>
              <div className="grid grid-cols-6 gap-1.5">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block text-center mb-0.5">FUE</label>
                  <input required type="number" name="str" value={formData.str} onChange={handleChange} min="1" max="30"
                    className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-center text-white focus:border-yellow-500 outline-none text-xs font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block text-center mb-0.5">DES</label>
                  <input required type="number" name="dexterity" value={formData.dexterity} onChange={handleChange} min="1" max="30"
                    className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-center text-white focus:border-yellow-500 outline-none text-xs font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block text-center mb-0.5">CON</label>
                  <input required type="number" name="con" value={formData.con} onChange={handleChange} min="1" max="30"
                    className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-center text-white focus:border-yellow-500 outline-none text-xs font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block text-center mb-0.5">INT</label>
                  <input required type="number" name="int" value={formData.int} onChange={handleChange} min="1" max="30"
                    className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-center text-white focus:border-yellow-500 outline-none text-xs font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block text-center mb-0.5">SAB</label>
                  <input required type="number" name="wis" value={formData.wis} onChange={handleChange} min="1" max="30"
                    className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-center text-white focus:border-yellow-500 outline-none text-xs font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block text-center mb-0.5">CAR</label>
                  <input required type="number" name="cha" value={formData.cha} onChange={handleChange} min="1" max="30"
                    className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-center text-white focus:border-yellow-500 outline-none text-xs font-bold" />
                </div>
              </div>
            </div>

            {/* HABILIDADES ESPECIALES */}
            <div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-1 mb-2">
                <label className="text-xs text-gray-400 font-bold uppercase">Habilidades Especiales</label>
                <button type="button" onClick={() => setSpecialAbilities([...specialAbilities, { name: '', desc: '' }])}
                  className="bg-gray-700 hover:bg-gray-600 text-yellow-500 text-[10px] uppercase px-2 py-0.5 rounded font-black transition-all">
                  + Añadir
                </button>
              </div>
              <div className="space-y-2">
                {specialAbilities.map((ab, i) => (
                  <div key={i} className="flex gap-2 border border-gray-700/50 p-2 rounded bg-gray-900/30 relative">
                    <div className="flex-grow flex flex-col gap-1.5">
                      <input required type="text" placeholder="Nombre (ej: Tácticas de Manada)" value={ab.name}
                        onChange={(e) => {
                          const updated = [...specialAbilities];
                          updated[i].name = e.target.value;
                          setSpecialAbilities(updated);
                        }}
                        className="bg-gray-900 border border-gray-600 rounded p-1.5 text-xs text-white outline-none focus:border-yellow-500" />
                      <textarea required placeholder="Descripción de la habilidad..." value={ab.desc}
                        onChange={(e) => {
                          const updated = [...specialAbilities];
                          updated[i].desc = e.target.value;
                          setSpecialAbilities(updated);
                        }}
                        className="bg-gray-900 border border-gray-600 rounded p-1.5 text-xs text-white outline-none focus:border-yellow-500 h-12 resize-none" />
                    </div>
                    <button type="button" onClick={() => setSpecialAbilities(specialAbilities.filter((_, idx) => idx !== i))}
                      className="text-gray-500 hover:text-red-400 text-sm font-bold self-start mt-1">✖</button>
                  </div>
                ))}
                {specialAbilities.length === 0 && <p className="text-[11px] text-gray-500 italic">No tiene habilidades especiales.</p>}
              </div>
            </div>

            {/* ACCIONES */}
            <div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-1 mb-2">
                <label className="text-xs text-gray-400 font-bold uppercase">Acciones / Ataques</label>
                <button type="button" onClick={() => setActions([...actions, { name: '', desc: '' }])}
                  className="bg-gray-700 hover:bg-gray-600 text-yellow-500 text-[10px] uppercase px-2 py-0.5 rounded font-black transition-all">
                  + Añadir
                </button>
              </div>
              <div className="space-y-2">
                {actions.map((act, i) => (
                  <div key={i} className="flex gap-2 border border-gray-700/50 p-2 rounded bg-gray-900/30 relative">
                    <div className="flex-grow flex flex-col gap-1.5">
                      <input required type="text" placeholder="Nombre (ej: Garra, Mordisco)" value={act.name}
                        onChange={(e) => {
                          const updated = [...actions];
                          updated[i].name = e.target.value;
                          setActions(updated);
                        }}
                        className="bg-gray-900 border border-gray-600 rounded p-1.5 text-xs text-white outline-none focus:border-yellow-500" />
                      <textarea required placeholder="Descripción de la acción (daño, alcance...)" value={act.desc}
                        onChange={(e) => {
                          const updated = [...actions];
                          updated[i].desc = e.target.value;
                          setActions(updated);
                        }}
                        className="bg-gray-900 border border-gray-600 rounded p-1.5 text-xs text-white outline-none focus:border-yellow-500 h-12 resize-none" />
                    </div>
                    <button type="button" onClick={() => setActions(actions.filter((_, idx) => idx !== i))}
                      className="text-gray-500 hover:text-red-400 text-sm font-bold self-start mt-1">✖</button>
                  </div>
                ))}
                {actions.length === 0 && <p className="text-[11px] text-gray-500 italic">No tiene acciones registradas.</p>}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} type="button" className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">Cancelar</button>
          <button form="monster-form" type="submit" disabled={loading}
            className={`px-6 py-2 rounded font-bold text-white transition-colors text-sm ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600'}`}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonsterCreatorModal;
