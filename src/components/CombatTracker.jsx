import React, { useState } from "react";

// Lista de condiciones (Iconos)
const CONDITIONS = [
  { label: "Blind", icon: "👁️‍🗨️" },
  { label: "Charmed", icon: "😍" },
  { label: "Deaf", icon: "🙉" },
  { label: "Frightened", icon: "😱" },
  { label: "Grappled", icon: "✊" },
  { label: "Incap", icon: "🤕" },
  { label: "Invis", icon: "👻" },
  { label: "Paralyzed", icon: "⚡" },
  { label: "Petrified", icon: "🗿" },
  { label: "Poisoned", icon: "🤢" },
  { label: "Prone", icon: "🛌" },
  { label: "Restrained", icon: "⛓️" },
  { label: "Stunned", icon: "💫" },
  { label: "Unconsc", icon: "💤" },
];

// --- SUB-COMPONENTE: Fila Individual ---
const CombatantRow = ({
  combatant,
  onRemove,
  onUpdateHP,
  onToggleCondition,
  isActive,
  onUpdateStats,
  onUpdateDeathSaves,
  onViewStatBlock,
  onUpdateInitiative, // <--- NUEVO: Recibimos la función
}) => {
  const [delta, setDelta] = useState("");
  const [showConditions, setShowConditions] = useState(false);

  // Manejar Daño/Cura
  const handleDelta = (multiplier) => {
    const amount = delta === "" ? 1 : parseInt(delta);
    if (isNaN(amount)) return;
    onUpdateHP(combatant.id, amount * multiplier);
    setDelta("");
  };

  const hpPercent = (combatant.hp / combatant.maxHp) * 100;

  const handleEditStat = (field, currentValue) => {
    const newValue = prompt(
      `Nuevo valor para ${field === "ac" ? "AC" : "Max HP"}:`,
      currentValue,
    );
    if (newValue !== null && !isNaN(newValue) && newValue !== "") {
      onUpdateStats(combatant.id, field, newValue);
    }
  };

  // --- NUEVO: Editar Iniciativa ---
  const handleEditInitiative = () => {
    const newInit = prompt(
      `Nueva iniciativa para ${combatant.name}:`,
      combatant.initiative,
    );
    if (newInit !== null && !isNaN(newInit) && newInit !== "") {
      onUpdateInitiative(combatant.id, parseInt(newInit));
    }
  };

  const activeStyle = isActive
    ? "border-l-4 border-yellow-400 bg-gray-700 shadow-[0_0_20px_rgba(234,179,8,0.15)] z-10 scale-[1.01]"
    : "border-l-4 border-gray-600 bg-gray-800/50 hover:bg-gray-700 opacity-90 hover:opacity-100";

  const DeathSaveSelector = ({ type, count, color }) => (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          onClick={() =>
            onUpdateDeathSaves(combatant.id, type, i === count ? i - 1 : i)
          }
          className={`w-3 h-3 rounded-full border border-gray-500 cursor-pointer ${
            i <= count ? color : "bg-gray-800"
          } hover:scale-125 transition-transform`}
          title={`Marcar ${i}`}
        ></div>
      ))}
    </div>
  );

  return (
    <div
      className={`p-3 rounded mb-3 transition-all duration-300 relative mx-1 ${activeStyle}`}
    >
      {isActive && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-gray-900 text-[9px] font-bold px-3 py-0.5 rounded-b-lg shadow-lg border-t-0 border border-yellow-600 z-20">
          TURNO ACTIVO
        </div>
      )}

      <div className="flex justify-between items-start gap-2">
        {/* IZQUIERDA: Datos del Personaje */}
        <div className="flex items-center gap-3 flex-grow min-w-0">
          {/* --- NUEVO: Bloque de Iniciativa Clicable --- */}
          <div
            onClick={handleEditInitiative}
            className="flex flex-col items-center min-w-[36px] cursor-pointer hover:bg-gray-600 p-1 rounded transition-colors border border-transparent hover:border-yellow-500/50"
            title="Editar Iniciativa"
          >
            <span
              className={`font-bold text-xl leading-none ${isActive ? "text-yellow-400" : "text-gray-500"}`}
            >
              {combatant.initiative}
            </span>
            <span className="text-[8px] text-gray-500 uppercase mt-0.5 font-bold">
              Init
            </span>
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3">
              <span
                className={`font-medium text-lg truncate ${isActive ? "text-white" : "text-gray-300"}`}
              >
                {combatant.name}
              </span>

              {combatant.apiIndex && (
                <button
                  onClick={() =>
                    onViewStatBlock(combatant.apiIndex, combatant.localData)
                  }
                  className="text-gray-400 hover:text-yellow-400 transition-colors mx-2"
                  title="Ver Ficha de Monstruo"
                >
                  👁️
                </button>
              )}

              <div
                onClick={() => handleEditStat("ac", combatant.ac || 10)}
                className="flex items-center gap-1 bg-gray-900/60 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-600 border border-gray-700 group transition-colors"
                title="Editar AC"
              >
                <span className="text-xs">🛡️</span>
                <span className="text-xs font-bold text-blue-300 group-hover:text-white">
                  {combatant.ac || 10}
                </span>
              </div>

              <button
                onClick={() => setShowConditions(!showConditions)}
                className="text-xs text-gray-500 hover:text-white px-1 border border-gray-700 rounded hover:bg-gray-600 transition-colors"
              >
                +FX
              </button>
            </div>

            {/* LÓGICA DE VIDA vs MUERTE */}
            {combatant.hp > 0 ? (
              <div className="w-full h-1.5 bg-gray-900 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full ${hpPercent <= 20 ? "bg-red-500" : hpPercent <= 50 ? "bg-yellow-500" : "bg-green-500"} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
                ></div>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between bg-gray-900/80 p-1.5 rounded border border-red-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-green-500 uppercase font-bold tracking-wider">
                    Éxito
                  </span>
                  <DeathSaveSelector
                    type="success"
                    count={combatant.deathSaves?.success || 0}
                    color="bg-green-500"
                  />
                </div>
                <div className="w-px h-3 bg-gray-700 mx-1"></div>
                <div className="flex items-center gap-2">
                  <DeathSaveSelector
                    type="failure"
                    count={combatant.deathSaves?.failure || 0}
                    color="bg-red-600"
                  />
                  <span className="text-[9px] text-red-500 uppercase font-bold tracking-wider">
                    Fallo
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs ${combatant.hp === 0 ? "text-red-500 font-bold animate-pulse" : "text-gray-400"}`}
              >
                HP: {combatant.hp}{" "}
                <span
                  onClick={() => handleEditStat("maxHp", combatant.maxHp)}
                  className="text-gray-600 hover:text-white cursor-pointer hover:underline"
                  title="Editar Vida Máxima"
                >
                  / {combatant.maxHp}
                </span>
              </span>

              <div className="flex gap-1 flex-wrap">
                {combatant.conditions &&
                  combatant.conditions.map((icon, i) => (
                    <span
                      key={i}
                      className="text-sm cursor-help"
                      title="Estado activo"
                    >
                      {icon}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* DERECHA: Botones de Acción */}
        <div className="flex items-center gap-1 shrink-0 ml-2 bg-gray-900/50 p-1 rounded">
          <button
            onClick={() => handleDelta(-1)}
            className="w-8 h-8 flex items-center justify-center bg-red-900/40 hover:bg-red-600 text-red-200 hover:text-white rounded transition-colors font-bold text-lg"
            title="Dañar"
          >
            -
          </button>
          <input
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="1"
            className="w-10 h-8 bg-gray-800 text-center text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 appearance-none"
          />
          <button
            onClick={() => handleDelta(1)}
            className="w-8 h-8 flex items-center justify-center bg-green-900/40 hover:bg-green-600 text-green-200 hover:text-white rounded transition-colors font-bold text-lg"
            title="Curar"
          >
            +
          </button>
          <button
            onClick={() => onRemove(combatant.id)}
            className="ml-2 text-gray-600 hover:text-red-400 w-6 flex justify-center"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      </div>

      {showConditions && (
        <div className="mt-2 p-2 bg-gray-900 rounded grid grid-cols-7 gap-1 animate-fade-in">
          {CONDITIONS.map((cond) => (
            <button
              key={cond.label}
              onClick={() => onToggleCondition(combatant.id, cond.icon)}
              className={`text-sm p-1 rounded hover:bg-gray-700 transition-colors ${combatant.conditions?.includes(cond.icon) ? "bg-blue-900 ring-1 ring-blue-500" : ""}`}
              title={cond.label}
            >
              {cond.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const CombatTracker = ({
  combatants,
  onAdd,
  onRemove,
  onUpdateHP,
  onToggleCondition,
  currentTurnIndex,
  roundCount,
  onNextTurn,
  onReset,
  onOpenPartyModal,
  onUpdateStats,
  onUpdateDeathSaves,
  onViewStatBlock,
  onOpenEncounterModal,
  onUpdateInitiative, // <--- NUEVO
  onClearMonsters, // <--- NUEVO
}) => {
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");
  const [hp, setHp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !initiative) return;
    onAdd({
      name,
      initiative: parseInt(initiative),
      hp: parseInt(hp) || 10,
      maxHp: parseInt(hp) || 10,
      conditions: [],
    });
    setName("");
    setInitiative("");
    setHp("");
  };

  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            <span>⚔️</span> Combate
          </h2>
          <button
            onClick={onOpenPartyModal}
            className="bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-xs px-2 py-1 rounded border border-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>🛡️</span> Grupo
          </button>
          <button
            onClick={onOpenEncounterModal}
            className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-xs px-2 py-1 rounded border border-purple-800 flex items-center gap-1 transition-colors"
            title="Gestor de Encuentros"
          >
            <span>📜</span> Encuentros
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase">Ronda</span>
          <span className="bg-gray-900 text-yellow-500 font-bold px-3 py-1 rounded border border-gray-600">
            {roundCount}
          </span>
        </div>
      </div>

      {/* Formulario Rápido */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Añadir PJ/NPC..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 w-full text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
        <input
          type="number"
          placeholder="Init"
          value={initiative}
          onChange={(e) => setInitiative(e.target.value)}
          className="bg-gray-700 rounded px-2 py-2 w-16 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-600 px-4 rounded text-white font-bold text-lg leading-none transition-colors"
        >
          +
        </button>
      </form>

      {/* Lista Scrolleable */}
      <div className="flex-grow overflow-y-auto custom-scrollbar px-2 pt-4 pb-20 space-y-2">
        {combatants.map((c, index) => (
          <CombatantRow
            key={c.id}
            combatant={c}
            onRemove={onRemove}
            onUpdateHP={onUpdateHP}
            onToggleCondition={onToggleCondition}
            isActive={index === currentTurnIndex}
            onUpdateStats={onUpdateStats}
            onUpdateDeathSaves={onUpdateDeathSaves}
            onViewStatBlock={onViewStatBlock}
            onUpdateInitiative={onUpdateInitiative} // <--- Pasamos la función al hijo
          />
        ))}
      </div>

      {/* Botonera Flotante */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent flex gap-3 z-10">
        <button
          onClick={onReset}
          className="bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-300 p-3 rounded-lg border border-gray-700 transition-colors"
          title="Eliminar A TODOS y reiniciar combate"
        >
          🗑️
        </button>

        {/* --- NUEVO: Botón de limpiar monstruos --- */}
        <button
          onClick={onClearMonsters}
          className="bg-gray-800 hover:bg-orange-900/50 text-gray-400 hover:text-orange-300 p-3 rounded-lg border border-gray-700 transition-colors"
          title="Limpiar Monstruos (Dejar solo a los PJs vivos)"
        >
          🧹
        </button>

        <button
          onClick={onNextTurn}
          className="flex-grow btn-gold py-3 rounded-lg flex items-center justify-center gap-2 text-lg"
        >
          <span>Siguiente Turno</span>
          <span className="text-xl">⏭️</span>
        </button>
      </div>
    </div>
  );
};

export default CombatTracker;
