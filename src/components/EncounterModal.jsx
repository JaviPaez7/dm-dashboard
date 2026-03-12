import React, { useState, useEffect } from "react";

const EncounterModal = ({
  isOpen,
  onClose,
  currentCombatants,
  onLoadEncounter,
}) => {
  const [encounters, setEncounters] = useState([]);
  const [newEncounterName, setNewEncounterName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // --- NUEVOS ESTADOS PARA TIRAR INICIATIVA ---
  const [deployingEncounter, setDeployingEncounter] = useState(null);
  const [initiativeRolls, setInitiativeRolls] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("dm_encounters");
    if (saved) setEncounters(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("dm_encounters", JSON.stringify(encounters));
  }, [encounters]);

  const handleSaveCurrent = () => {
    if (!newEncounterName.trim()) {
      setErrorMsg("⚠️ Escribe un nombre para el encuentro.");
      return;
    }
    if (currentCombatants.length === 0) {
      setErrorMsg("⚠️ La mesa está vacía. Añade monstruos primero.");
      return;
    }

    setErrorMsg("");
    const cleanCombatants = currentCombatants.map((c) => ({
      ...c,
      hp: c.maxHp,
      conditions: [],
      initiative: 0,
      deathSaves: { success: 0, failure: 0 },
    }));

    const newEncounter = {
      id: Date.now(),
      name: newEncounterName,
      monsters: cleanCombatants,
      date: new Date().toLocaleDateString(),
    };
    setEncounters([newEncounter, ...encounters]);
    setNewEncounterName("");
  };

  const handleConfirmDelete = (id) => {
    setEncounters(encounters.filter((e) => e.id !== id));
    setConfirmDeleteId(null);
  };

  // --- PASO 1: Iniciar Despliegue de Encuentro ---
  const handleStartDeploy = (encounter) => {
    const rolls = {};
    encounter.monsters.forEach((m, idx) => (rolls[idx] = "")); // Usamos el índice porque varios monstruos pueden ser iguales
    setInitiativeRolls(rolls);
    setDeployingEncounter(encounter);
  };

  // --- PASO 2: Confirmar y enviar al combate ---
  const handleConfirmDeploy = () => {
    const squadWithInit = deployingEncounter.monsters.map((m, idx) => ({
      ...m,
      initiative: parseInt(initiativeRolls[idx]) || 0,
      id: Date.now() + Math.random(), // Generamos IDs limpios para el combate nuevo
    }));

    onLoadEncounter(squadWithInit);
    setDeployingEncounter(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4"
      onClick={() => {
        onClose();
        setConfirmDeleteId(null);
        setDeployingEncounter(null);
      }}
    >
      <div
        className="bg-[#1a1c23] text-gray-200 rounded-lg shadow-2xl w-full max-w-2xl border border-yellow-700/50 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-lg">
          <h2 className="text-xl font-bold text-yellow-500 font-fantasy flex items-center gap-2">
            <span>{deployingEncounter ? "🎲" : "⚔️"}</span>
            {deployingEncounter
              ? `Desplegando: ${deployingEncounter.name}`
              : "Gestor de Encuentros"}
          </h2>
          <button
            onClick={() => {
              onClose();
              setDeployingEncounter(null);
            }}
            className="text-gray-400 hover:text-white"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {/* =========================================
              VISTA 1: TIRAR INICIATIVA DE MONSTRUOS
              ========================================= */}
          {deployingEncounter ? (
            <div className="animate-fade-in">
              <p className="text-gray-400 text-sm mb-4">
                Mete los resultados de iniciativa. Si quieres que los goblins
                ataquen a la vez, ponles el mismo número.
              </p>

              <div className="space-y-2 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                {deployingEncounter.monsters.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700"
                  >
                    <div>
                      <span className="font-bold text-white text-lg block">
                        {m.name}
                      </span>
                      <span className="text-xs text-gray-500 italic">
                        HP: {m.maxHp} | AC: {m.ac || 10}
                      </span>
                    </div>
                    <input
                      type="number"
                      autoFocus={idx === 0}
                      placeholder="Init..."
                      className="bg-gray-700 text-white rounded px-3 py-2 w-24 text-center outline-none focus:ring-2 focus:ring-yellow-500 font-bold"
                      value={initiativeRolls[idx]}
                      onChange={(e) =>
                        setInitiativeRolls({
                          ...initiativeRolls,
                          [idx]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDeployingEncounter(null)}
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
            /* =========================================
             VISTA 2: GESTIÓN DE ENCUENTROS NORMAL
             ========================================= */
            <div className="animate-fade-in space-y-8">
              <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">
                  Guardar Mesa Actual
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre del encuentro (ej. Campamento Goblin)"
                    className="flex-grow bg-gray-900 border border-gray-600 p-2 rounded text-white focus:border-yellow-500 outline-none"
                    value={newEncounterName}
                    onChange={(e) => {
                      setNewEncounterName(e.target.value);
                      setErrorMsg("");
                    }}
                  />
                  <button
                    onClick={handleSaveCurrent}
                    className="bg-green-700 hover:bg-green-600 text-white px-4 rounded font-bold transition-colors flex items-center gap-2"
                  >
                    <span>💾</span> Guardar
                  </button>
                </div>
                {errorMsg ? (
                  <p className="text-xs text-red-400 mt-2 font-bold animate-pulse">
                    {errorMsg}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Se guardarán los <strong>{currentCombatants.length}</strong>{" "}
                    combatientes actuales.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 border-b border-gray-700 pb-1">
                  Encuentros Preparados
                </h3>
                {encounters.length === 0 ? (
                  <p className="text-center text-gray-600 py-4 italic">
                    No hay encuentros guardados.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {encounters.map((encounter) => (
                      <div
                        key={encounter.id}
                        className={`flex items-center justify-between bg-gray-900 p-3 rounded border transition-colors ${confirmDeleteId === encounter.id ? "border-red-500 bg-red-900/10" : "border-gray-800"}`}
                      >
                        <div className="min-w-0 flex-grow mr-4">
                          <h4 className="font-bold text-yellow-500 text-lg truncate">
                            {encounter.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {encounter.date} • {encounter.monsters.length}{" "}
                            criaturas
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          {confirmDeleteId === encounter.id ? (
                            <div className="flex items-center gap-2 animate-fade-in">
                              <span className="text-[10px] text-red-400 font-bold uppercase tracking-tighter">
                                ¿Borrar?
                              </span>
                              <button
                                onClick={() =>
                                  handleConfirmDelete(encounter.id)
                                }
                                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg"
                              >
                                CONFIRMAR
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1.5 rounded"
                              >
                                ✖
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartDeploy(encounter)}
                                className="bg-blue-900/50 hover:bg-blue-600 text-blue-200 hover:text-white px-3 py-1.5 rounded text-sm font-bold border border-blue-800 transition-colors"
                              >
                                Cargar
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(encounter.id)}
                                className="text-gray-600 hover:text-red-500 px-2 transition-colors"
                                title="Borrar Encuentro"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncounterModal;
