import React, { useState, useEffect } from "react";

const EncounterModal = ({
  isOpen,
  onClose,
  currentCombatants,
  onLoadEncounter,
}) => {
  const [encounters, setEncounters] = useState([]);
  const [newEncounterName, setNewEncounterName] = useState("");

  // Cargar encuentros guardados al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("dm_encounters");
    if (saved) setEncounters(JSON.parse(saved));
  }, []);

  // Guardar en LocalStorage cada vez que cambia la lista
  useEffect(() => {
    localStorage.setItem("dm_encounters", JSON.stringify(encounters));
  }, [encounters]);

  // --- GUARDAR LA MESA ACTUAL ---
  const handleSaveCurrent = () => {
    if (!newEncounterName.trim()) return alert("Ponle un nombre al encuentro.");
    if (currentCombatants.length === 0)
      return alert("La mesa está vacía. Añade monstruos primero.");

    // Limpiamos los datos para guardarlos "frescos" (sin daño, sin iniciativa vieja)
    const cleanCombatants = currentCombatants.map((c) => ({
      ...c,
      hp: c.maxHp, // Restauramos la vida al máximo
      conditions: [], // Quitamos estados alterados
      initiative: 0, // Reiniciamos iniciativa (se tirará al cargar)
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

  const handleDelete = (id) => {
    if (confirm("¿Borrar este encuentro para siempre?")) {
      setEncounters(encounters.filter((e) => e.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1c23] text-gray-200 rounded-lg shadow-2xl w-full max-w-2xl border border-yellow-700/50 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-lg">
          <h2 className="text-xl font-bold text-yellow-500 font-fantasy flex items-center gap-2">
            <span>⚔️</span> Gestor de Encuentros
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {/* SECCIÓN 1: GUARDAR NUEVO */}
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
                onChange={(e) => setNewEncounterName(e.target.value)}
              />
              <button
                onClick={handleSaveCurrent}
                className="bg-green-700 hover:bg-green-600 text-white px-4 rounded font-bold transition-colors flex items-center gap-2"
              >
                <span>💾</span> Guardar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Se guardarán los <strong>{currentCombatants.length}</strong>{" "}
              combatientes actuales con su vida al máximo.
            </p>
          </div>

          {/* SECCIÓN 2: LISTA DE ENCUENTROS */}
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
                    className="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-800 hover:border-gray-600 transition-colors group"
                  >
                    <div>
                      <h4 className="font-bold text-yellow-500 text-lg">
                        {encounter.name}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {encounter.date} • {encounter.monsters.length} criaturas
                        <span className="text-gray-600 ml-2">
                          (
                          {encounter.monsters
                            .slice(0, 3)
                            .map((m) => m.name)
                            .join(", ")}
                          {encounter.monsters.length > 3 ? "..." : ""})
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onLoadEncounter(encounter.monsters);
                          onClose();
                        }}
                        className="bg-blue-900/50 hover:bg-blue-600 text-blue-200 hover:text-white px-3 py-1.5 rounded text-sm font-bold border border-blue-800 transition-colors"
                      >
                        Cargar
                      </button>
                      <button
                        onClick={() => handleDelete(encounter.id)}
                        className="text-gray-600 hover:text-red-500 px-2 transition-colors"
                        title="Borrar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncounterModal;
