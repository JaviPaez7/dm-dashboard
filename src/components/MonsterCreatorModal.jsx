import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const INITIAL_STATE = {
  name: '',
  type: 'custom',
  hp: 10,
  ac: 10,
  dexterity: 10,
  cr: '1',
};

const MonsterCreatorModal = ({ isOpen, onClose, onMonsterCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['hp', 'ac', 'dexterity'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('Debes estar logueado para crear monstruos.');

      const newMonster = {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        hp: formData.hp,
        ac: formData.ac,
        dexterity: formData.dexterity,
        cr: formData.cr,
        stats: {} 
      };

      const { data, error: dbError } = await supabase
        .from('custom_monsters')
        .insert([newMonster])
        .select()
        .single();

      if (dbError) throw dbError;

      onMonsterCreated(data); 
      onClose();
      setFormData(INITIAL_STATE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-yellow-500">🛠️ Crear Monstruo Custom</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✖</button>
        </div>

        <div className="p-4 overflow-y-auto">
          {error && <div className="mb-4 text-red-400 text-sm bg-red-900/20 p-2 border border-red-500 rounded">{error}</div>}
          
          <form id="monster-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Nombre</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none" placeholder="Ej: Rey Goblin" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">HP (Vida Máx)</label>
                <input required type="number" name="hp" value={formData.hp} onChange={handleChange} min="1"
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">CA (Armadura)</label>
                <input required type="number" name="ac" value={formData.ac} onChange={handleChange} min="1"
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1" title="Determina el bono al tirar iniciativa">DEX (Destreza)</label>
                <input required type="number" name="dexterity" value={formData.dexterity} onChange={handleChange} min="1" max="30"
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Desafío (CR)</label>
                <input required type="text" name="cr" value={formData.cr} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none" placeholder="Ej: 1/4, 2, 5" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Tipo</label>
              <input type="text" name="type" value={formData.type} onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none" placeholder="Ej: bestia, humanoide..." />
            </div>
          </form>
        </div>

        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancelar</button>
          <button form="monster-form" type="submit" disabled={loading}
            className={`px-6 py-2 rounded font-bold text-white transition-colors ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600'}`}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonsterCreatorModal;
