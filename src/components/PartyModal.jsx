import React, { useState } from "react";

const PartyModal = ({
  isOpen,
  onClose,
  party,
  onSavePartyMember,
  onDeletePartyMember,
  onAddToCombat,
  onDeployAll,
}) => {
  // <--- Nueva prop onDeployAll
  const [newPlayer, setNewPlayer] = useState({ name: "", maxHp: "", ac: "" });

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.maxHp) return;
    onSavePartyMember({
      id: Date.now(),
      name: newPlayer.name,
      maxHp: parseInt(newPlayer.maxHp),
      hp: parseInt(newPlayer.maxHp),
      ac: parseInt(newPlayer.ac) || 10,
      isPlayer: true,
    });
    setNewPlayer({ name: "", maxHp: "", ac: "" });
  };

  // --- NUEVA LÓGICA: Despliegue Masivo ---
  const handleDeploySquad = () => {
    if (party.length === 0) return;

    const squad = [];

    // Preguntamos iniciativa para cada uno
    for (const member of party) {
      const initStr = prompt(`🎲 Iniciativa para ${member.name}:`, "");

      // Si le das a Cancelar en uno, saltamos ese jugador pero seguimos con los demás
      if (initStr === null) continue;

      squad.push({
        ...member,
        initiative: parseInt(initStr) || 0,
        id: Date.now() + Math.random(), // ID único temporal
      });
    }

    if (squad.length > 0) {
      onDeployAll(squad); // Enviamos el array completo a App.jsx
      onClose(); // Cerramos el modal
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2">
          <span>🛡️</span> Gestión del Grupo
        </h2>

        {/* Formulario Crear */}
        <form
          onSubmit={handleSave}
          className="bg-gray-900/50 p-4 rounded-lg mb-6 border border-gray-700"
        >
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Nombre"
              className="bg-gray-800 text-white rounded px-3 py-2 w-full outline-none focus:ring-1 focus:ring-yellow-500"
              value={newPlayer.name}
              onChange={(e) =>
                setNewPlayer({ ...newPlayer, name: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="HP Max"
              className="bg-gray-800 text-white rounded px-3 py-2 w-1/2 outline-none focus:ring-1 focus:ring-yellow-500"
              value={newPlayer.maxHp}
              onChange={(e) =>
                setNewPlayer({ ...newPlayer, maxHp: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="AC"
              className="bg-gray-800 text-white rounded px-3 py-2 w-1/2 outline-none focus:ring-1 focus:ring-yellow-500"
              value={newPlayer.ac}
              onChange={(e) =>
                setNewPlayer({ ...newPlayer, ac: e.target.value })
              }
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 rounded"
            >
              💾
            </button>
          </div>
        </form>

        {/* --- BOTÓN DESPLIEGUE MASIVO --- */}
        {party.length > 0 && (
          <button
            onClick={handleDeploySquad}
            className="w-full mb-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all"
          >
            <span>🚀</span> Desplegar Escuadrón Completo
          </button>
        )}

        {/* Lista Individual */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {party.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-gray-700 p-2 rounded border-l-4 border-blue-500"
            >
              <div>
                <div className="font-bold text-white">{p.name}</div>
                <div className="text-xs text-gray-400">
                  HP: {p.maxHp} | AC: {p.ac}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onAddToCombat(p)}
                  className="text-blue-300 hover:text-white text-xs underline"
                >
                  Añadir Indiv.
                </button>
                <button
                  onClick={() => onDeletePartyMember(p.id)}
                  className="text-gray-500 hover:text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartyModal;
