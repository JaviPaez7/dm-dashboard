import React, { useState, useEffect } from "react";

const PartyModal = ({
  isOpen,
  onClose,
  party,
  onSavePartyMember,
  onDeletePartyMember,
  onAddToCombat,
  onDeployAll,
  onLongRest,
}) => {
  const [newPlayer, setNewPlayer] = useState({ name: "", maxHp: "", ac: "" });
  const [editingId, setEditingId] = useState(null); // Nuevo estado para saber a quién editamos

  if (!isOpen) return null;

  // --- FUNCIÓN PARA GUARDAR O ACTUALIZAR ---
  const handleSave = (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.maxHp) return;

    onSavePartyMember({
      id: editingId || Date.now(), // Si editamos, mantenemos el ID. Si no, creamos uno.
      name: newPlayer.name,
      maxHp: parseInt(newPlayer.maxHp),
      hp: editingId
        ? party.find((p) => p.id === editingId).hp // Si editamos, mantenemos su vida actual
        : parseInt(newPlayer.maxHp), // Si es nuevo, vida a tope
      ac: parseInt(newPlayer.ac) || 10,
      isPlayer: true,
    });

    setNewPlayer({ name: "", maxHp: "", ac: "" });
    setEditingId(null);
  };

  // --- PREPARAR EDICIÓN ---
  const handleEdit = (player) => {
    setNewPlayer({ name: player.name, maxHp: player.maxHp, ac: player.ac });
    setEditingId(player.id);
  };

  const handleDeploySquad = () => {
    if (party.length === 0) return;
    const squad = [];
    for (const member of party) {
      const initStr = prompt(`🎲 Iniciativa para ${member.name}:`, "");
      if (initStr === null) continue;
      squad.push({
        ...member,
        initiative: parseInt(initStr) || 0,
        id: Date.now() + Math.random(),
      });
    }
    if (squad.length > 0) {
      onDeployAll(squad);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <button
          onClick={() => {
            onClose();
            setEditingId(null);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2">
          <span>🛡️</span>{" "}
          {editingId ? "Editando Personaje" : "Gestión del Grupo"}
        </h2>

        {/* Formulario Crear / Editar */}
        <form
          onSubmit={handleSave}
          className={`p-4 rounded-lg mb-6 border transition-colors ${editingId ? "bg-blue-900/20 border-blue-500" : "bg-gray-900/50 border-gray-700"}`}
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
              className={`font-bold px-4 rounded transition-colors ${editingId ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"}`}
            >
              {editingId ? "OK" : "💾"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setNewPlayer({ name: "", maxHp: "", ac: "" });
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 rounded"
              >
                ✖
              </button>
            )}
          </div>
        </form>

        {party.length > 0 && !editingId && (
          <button
            onClick={handleDeploySquad}
            className="w-full mb-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2"
          >
            <span>🚀</span> Desplegar Escuadrón Completo
          </button>
          
        )}

        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {party.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-gray-700 p-2 rounded border-l-4 border-blue-500"
            >
              <div className="min-w-0 flex-grow">
                <div className="font-bold text-white truncate">{p.name}</div>
                <div className="text-xs text-gray-400">
                  HP:{" "}
                  <span
                    className={
                      p.hp < p.maxHp
                        ? "text-red-400 font-bold"
                        : "text-green-400"
                    }
                  >
                    {p.hp}
                  </span>
                  /{p.maxHp} | CA: {p.ac}
                </div>
              </div>
              <div className="flex gap-2 items-center ml-2">
                <button
                  onClick={() => onAddToCombat(p)}
                  className="text-blue-300 hover:text-white text-[10px] uppercase font-bold px-2 py-1 bg-blue-900/30 rounded border border-blue-800/50"
                >
                  +1
                </button>
                <button
                  onClick={() => handleEdit(p)}
                  className="text-gray-400 hover:text-yellow-400 p-1"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeletePartyMember(p.id)}
                  className="text-gray-600 hover:text-red-400 p-1"
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
