import React, { useState } from 'react';
import pb from '../lib/pb';
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
      if (!user || user.isAnonymous) {
        throw new Error('Necesitas una cuenta (email o Google) para crear monstruos personalizados.');
      }

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

      const created = await pb.collection('custom_monsters').create(newMonster);
      const monsterData = { id: created.id, ...newMonster };

      onMonsterCreated(monsterData);
      onClose();
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
              ⚠️ Estás como <strong>Invitado</strong>. Crea una cuenta gratuita para guardar monstruos en la nube.
            </div>
          )}
          
          <form id="monster-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase">Nombre</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase">HP</label>
                <input type="number" name="hp" value={formData.hp} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase">CA</label>
                <input type="number" name="ac" value={formData.ac} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase">CR</label>
                <input name="cr" value={formData.cr} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['str','dexterity','con','int','wis','cha'].map(stat => (
                <div key={stat}>
                  <label className="text-xs text-gray-400 font-bold uppercase">{stat === 'dexterity' ? 'DEX' : stat.toUpperCase()}</label>
                  <input type="number" name={stat} value={formData[stat]} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase">Tamaño</label>
                <input name="size" value={formData.size} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase">Tipo</label>
                <input name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase">Alineamiento</label>
              <input name="alignment" value={formData.alignment} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase">Velocidad</label>
              <input name="speed" value={formData.speed} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-400 font-bold uppercase">Habilidades Especiales</label>
                <button type="button" onClick={() => setSpecialAbilities([...specialAbilities, { name: '', desc: '' }])} className="text-xs text-green-400 hover:text-green-300">+ Añadir</button>
              </div>
              {specialAbilities.map((sa, idx) => (
                <div key={idx} className="flex flex-col gap-1 mb-2 bg-gray-900/50 p-2 rounded border border-gray-700">
                  <input placeholder="Nombre" value={sa.name} onChange={e => {
                    const next = [...specialAbilities]; next[idx].name = e.target.value; setSpecialAbilities(next);
                  }} className="bg-gray-800 border border-gray-600 rounded p-1 text-sm text-white" />
                  <textarea placeholder="Descripción" value={sa.desc} onChange={e => {
                    const next = [...specialAbilities]; next[idx].desc = e.target.value; setSpecialAbilities(next);
                  }} className="bg-gray-800 border border-gray-600 rounded p-1 text-sm text-white" rows={2} />
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-400 font-bold uppercase">Acciones</label>
                <button type="button" onClick={() => setActions([...actions, { name: '', desc: '' }])} className="text-xs text-green-400 hover:text-green-300">+ Añadir</button>
              </div>
              {actions.map((act, idx) => (
                <div key={idx} className="flex flex-col gap-1 mb-2 bg-gray-900/50 p-2 rounded border border-gray-700">
                  <input placeholder="Nombre" value={act.name} onChange={e => {
                    const next = [...actions]; next[idx].name = e.target.value; setActions(next);
                  }} className="bg-gray-800 border border-gray-600 rounded p-1 text-sm text-white" />
                  <textarea placeholder="Descripción" value={act.desc} onChange={e => {
                    const next = [...actions]; next[idx].desc = e.target.value; setActions(next);
                  }} className="bg-gray-800 border border-gray-600 rounded p-1 text-sm text-white" rows={2} />
                </div>
              ))}
            </div>
          </form>
        </div>

        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancelar</button>
          <button form="monster-form" type="submit" disabled={loading || user?.isAnonymous} className="px-4 py-2 rounded text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50">
            {loading ? 'Guardando...' : 'Crear Monstruo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonsterCreatorModal;
