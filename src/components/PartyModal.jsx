import React, { useState } from "react";

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
  const [editingId, setEditingId] = useState(null);

  // --- ESTADOS PARA DESPLIEGUE MASIVO ---
  const [isDeploying, setIsDeploying] = useState(false);
  const [initiativeRolls, setInitiativeRolls] = useState({});

  // --- NUEVOS ESTADOS DE UI (Adiós Prompts/Alerts) ---
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // Borrado en 2 pasos
  const [showLongRest, setShowLongRest] = useState(false); // Modal interno descanso
  const [singleDeployId, setSingleDeployId] = useState(null); // Despliegue individual
  const [singleInitValue, setSingleInitValue] = useState("");

  if (!isOpen) return null;

  // --- FUNCIONES BÁSICAS ---
  const handleSave = (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.maxHp) return;

    onSavePartyMember({
      id: editingId || Date.now(),
      name: newPlayer.name,
      maxHp: parseInt(newPlayer.maxHp),
      hp: editingId
        ? party.find((p) => p.id === editingId).hp
        : parseInt(newPlayer.maxHp),
      ac: parseInt(newPlayer.ac) || 10,
      isPlayer: true,
    });

    setNewPlayer({ name: "", maxHp: "", ac: "" });
    setEditingId(null);
  };

  const handleEdit = (player) => {
    setNewPlayer({ name: player.name, maxHp: player.maxHp, ac: player.ac });
    setEditingId(player.id);
  };

  // --- DESPLIEGUE MASIVO ---
  const handleStartDeploy = () => {
    if (party.length === 0) return;
    const initialRolls = {};
    party.forEach((p) => (initialRolls[p.id] = ""));
    setInitiativeRolls(initialRolls);
    setIsDeploying(true);
  };

  const handleConfirmDeploy = () => {
    const squad = party.map((member) => ({
      ...member,
      initiative: parseInt(initiativeRolls[member.id]) || 0,
      id: Date.now() + Math.random(),
    }));
    onDeployAll(squad);
    setIsDeploying(false);
    onClose();
  };

  // --- DESPLIEGUE INDIVIDUAL ---
  const handleConfirmSingleDeploy = (player) => {
    onAddToCombat({
      ...player,
      initiative: parseInt(singleInitValue) || 0,
      id: Date.now() + Math.random(), // ID único para el tracker
    });
    setSingleDeployId(null);
    setSingleInitValue("");
    onClose(); // Puedes quitar esto si prefieres que el modal se quede abierto tras añadir uno
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up overflow-hidden">
        {/* === OVERLAY DE DESCANSO LARGO === */}
        {showLongRest && (
          <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 z-50 animate-fade-in">
            <span className="text-6xl mb-4">🏕️</span>
            <h3 className="text-2xl font-bold text-green-400 mb-2 font-fantasy">
              ¿Descanso Largo?
            </h3>
            <p className="text-gray-300 text-center mb-8">
              Tus jugadores recuperarán todos sus Puntos de Golpe máximos.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowLongRest(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onLongRest();
                  setShowLongRest(false);
                }}
                className="flex-1 px-4 py-3 bg-green-700 hover:bg-green-600 rounded-lg text-white font-bold transition-colors"
              >
                Dormir 💤
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setIsDeploying(false);
            setEditingId(null);
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          ✕
        </button>

        {/* === VISTA 1: DESPLIEGUE MASIVO === */}
        {isDeploying ? (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2">
              <span>🎲</span> Tirad Iniciativa
            </h2>
            <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar">
              {party.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700"
                >
                  <span className="font-bold text-white text-lg">{p.name}</span>
                  <input
                    type="number"
                    autoFocus={party[0].id === p.id}
                    placeholder="Init..."
                    className="bg-gray-700 text-white rounded px-3 py-2 w-24 text-center outline-none focus:ring-2 focus:ring-yellow-500 font-bold"
                    value={initiativeRolls[p.id]}
                    onChange={(e) =>
                      setInitiativeRolls({
                        ...initiativeRolls,
                        [p.id]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeploying(false)}
                className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmDeploy}
                className="w-2/3 bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2"
              >
                <span>⚔️</span> ¡A la batalla!
              </button>
            </div>
          </div>
        ) : (
          /* === VISTA 2: GESTIÓN DE GRUPO NORMAL === */
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2">
              <span>🛡️</span>{" "}
              {editingId ? "Editando Personaje" : "Gestión del Grupo"}
            </h2>

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
                    className="bg-gray-700 text-white px-3 rounded"
                  >
                    ✖
                  </button>
                )}
              </div>
            </form>

            {party.length > 0 && !editingId && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleStartDeploy}
                  className="w-2/3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
                >
                  <span>🚀</span> Desplegar Escuadrón
                </button>
                <button
                  onClick={() => setShowLongRest(true)}
                  className="w-1/3 bg-green-800 hover:bg-green-700 text-green-100 font-bold py-3 rounded-lg border border-green-600"
                >
                  <span>🏕️</span> Descanso
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {party.map((p) => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center bg-gray-700 p-2 rounded border-l-4 ${confirmDeleteId === p.id ? "border-red-500 bg-red-900/20" : "border-blue-500"}`}
                >
                  {/* Info o Input de Iniciativa Individual */}
                  <div className="min-w-0 flex-grow">
                    {singleDeployId === p.id ? (
                      <div className="flex items-center gap-2 animate-fade-in">
                        <input
                          type="number"
                          autoFocus
                          placeholder="Init..."
                          className="w-16 bg-gray-900 text-yellow-400 font-bold text-center rounded px-2 py-1 outline-none"
                          value={singleInitValue}
                          onChange={(e) => setSingleInitValue(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleConfirmSingleDeploy(p)
                          }
                        />
                        <span className="text-sm font-bold text-white">
                          Iniciativa
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          HP:{" "}
                          <span
                            className={
                              p.hp < p.maxHp
                                ? "text-red-400 font-bold"
                                : p.hp > p.maxHp
                                  ? "text-blue-400 font-bold"
                                  : "text-green-400"
                            }
                          >
                            {p.hp}
                          </span>
                          /{p.maxHp} | CA: {p.ac}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Botonera dinámica */}
                  <div className="flex gap-2 items-center ml-2">
                    {/* Modo Añadir Individual */}
                    {singleDeployId === p.id ? (
                      <>
                        <button
                          onClick={() => handleConfirmSingleDeploy(p)}
                          className="text-green-400 hover:text-green-300 font-bold px-2 py-1 bg-green-900/30 rounded"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => setSingleDeployId(null)}
                          className="text-gray-400 hover:text-white px-2 py-1 bg-gray-800 rounded"
                        >
                          ✖
                        </button>
                      </>
                    ) : confirmDeleteId === p.id ? (
                      /* Modo Confirmar Borrado (Doble clic) */
                      <>
                        <span className="text-xs text-red-400 animate-pulse font-bold mr-1">
                          ¿Seguro?
                        </span>
                        <button
                          onClick={() => {
                            onDeletePartyMember(p.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-white hover:text-red-200 px-2 py-1 bg-red-600 rounded shadow text-xs font-bold"
                        >
                          ⚠️ Sí
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-gray-400 hover:text-white px-2 py-1 bg-gray-800 rounded text-xs"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      /* Modo Normal */
                      <>
                        <button
                          onClick={() => {
                            setSingleDeployId(p.id);
                            setSingleInitValue("");
                          }}
                          className="text-blue-300 hover:text-white text-[10px] uppercase font-bold px-2 py-1 bg-blue-900/30 rounded border border-blue-800/50"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-gray-400 hover:text-yellow-400 p-1"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="text-gray-600 hover:text-red-400 p-1"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyModal;
