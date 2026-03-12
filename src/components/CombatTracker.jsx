import React, { useState, useRef, useEffect } from "react";

// (Las constantes CONDITIONS y el componente CombatantRow se mantienen igual que antes)
// ... [Pego aquí el código completo para que no te falte nada] ...

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

const CombatantRow = ({
  combatant,
  onRemove,
  onUpdateHP,
  onToggleCondition,
  isActive,
  onUpdateStats,
  onUpdateDeathSaves,
  onViewStatBlock,
  onUpdateInitiative,
}) => {
  const [delta, setDelta] = useState("");
  const [showConditions, setShowConditions] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  const intervalRef = useRef(null);
  const deltaRef = useRef(delta);
  useEffect(() => {
    deltaRef.current = delta;
  }, [delta]);

  const startDelta = (multiplier) => {
    const amount = deltaRef.current === "" ? 1 : parseInt(deltaRef.current);
    if (isNaN(amount)) return;
    onUpdateHP(combatant.id, amount * multiplier);
    intervalRef.current = setInterval(() => {
      onUpdateHP(combatant.id, amount * multiplier);
    }, 150);
  };

  const stopDelta = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDelta("");
  };

  const hpPercent = (combatant.hp / combatant.maxHp) * 100;

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editValue !== "" && !isNaN(editValue)) {
      const val = parseInt(editValue);
      if (editingField === "ac" || editingField === "maxHp") {
        onUpdateStats(combatant.id, editingField, val);
      } else if (editingField === "initiative") {
        onUpdateInitiative(combatant.id, val);
      }
    }
    setEditingField(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") setEditingField(null);
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
          className={`w-3 h-3 rounded-full border border-gray-500 cursor-pointer ${i <= count ? color : "bg-gray-800"} hover:scale-125 transition-transform`}
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
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="flex flex-col items-center min-w-[36px] cursor-pointer hover:bg-gray-600 p-1 rounded transition-colors">
            {editingField === "initiative" ? (
              <input
                autoFocus
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                className="w-10 bg-gray-900 text-yellow-400 font-bold text-center rounded focus:outline-none"
              />
            ) : (
              <div
                onClick={() => startEditing("initiative", combatant.initiative)}
                className="flex flex-col items-center w-full"
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
            )}
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
                >
                  👁️
                </button>
              )}
              <div
                className="flex items-center gap-1 bg-gray-900/60 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-600 border border-gray-700"
                onClick={() => startEditing("ac", combatant.ac)}
              >
                <span className="text-xs">🛡️</span>
                {editingField === "ac" ? (
                  <input
                    autoFocus
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    className="w-8 bg-gray-800 text-blue-300 text-center rounded text-xs"
                  />
                ) : (
                  <span className="text-xs font-bold text-blue-300">
                    {combatant.ac || 10}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowConditions(!showConditions)}
                className="text-xs text-gray-500 hover:text-white px-1 border border-gray-700 rounded"
              >
                +FX
              </button>
            </div>

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
                  <span className="text-[9px] text-green-500 font-bold">
                    ÉXITO
                  </span>
                  <DeathSaveSelector
                    type="success"
                    count={combatant.deathSaves?.success || 0}
                    color="bg-green-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <DeathSaveSelector
                    type="failure"
                    count={combatant.deathSaves?.failure || 0}
                    color="bg-red-600"
                  />
                  <span className="text-[9px] text-red-500 font-bold">
                    FALLO
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs flex items-center ${combatant.hp === 0 ? "text-red-500 font-bold animate-pulse" : "text-gray-400"}`}
              >
                HP: {combatant.hp} /
                {editingField === "maxHp" ? (
                  <input
                    autoFocus
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    className="w-10 bg-gray-800 text-center rounded text-xs ml-1"
                  />
                ) : (
                  <span
                    onClick={() => startEditing("maxHp", combatant.maxHp)}
                    className="ml-1 cursor-pointer hover:underline"
                  >
                    {combatant.maxHp}
                  </span>
                )}
              </span>
              <div className="flex gap-1 flex-wrap ml-2">
                {combatant.conditions?.map((icon, i) => (
                  <span key={i} className="text-sm">
                    {icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2 bg-gray-900/50 p-1 rounded">
          <button
            onPointerDown={() => startDelta(-1)}
            onPointerUp={stopDelta}
            onPointerLeave={stopDelta}
            className="w-8 h-8 flex items-center justify-center bg-red-900/40 hover:bg-red-600 text-red-200 rounded font-bold select-none"
            style={{ touchAction: "none" }}
          >
            -
          </button>
          <input
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="1"
            className="w-10 h-8 bg-gray-800 text-center text-white rounded text-sm outline-none"
          />
          <button
            onPointerDown={() => startDelta(1)}
            onPointerUp={stopDelta}
            onPointerLeave={stopDelta}
            className="w-8 h-8 flex items-center justify-center bg-green-900/40 hover:bg-green-600 text-green-200 rounded font-bold select-none"
            style={{ touchAction: "none" }}
          >
            +
          </button>
          <button
            onClick={() => onRemove(combatant.id)}
            className="ml-2 text-gray-600 hover:text-red-400 w-6"
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
              className={`text-sm p-1 rounded hover:bg-gray-700 ${combatant.conditions?.includes(cond.icon) ? "bg-blue-900 ring-1 ring-blue-500" : ""}`}
            >
              {cond.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL (Aquí están los botones de abajo)
// ==========================================
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
  onUpdateInitiative,
  onClearMonsters,
}) => {
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");
  const [hp, setHp] = useState("");

  // --- NUEVOS ESTADOS DE CONFIRMACIÓN ---
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmClearMonsters, setConfirmClearMonsters] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !initiative) return;
    onAdd({
      name,
      initiative: parseInt(initiative),
      hp: parseInt(hp) || 10,
      maxHp: parseInt(hp) || 10,
      conditions: [],
      isPlayer: false,
    });
    setName("");
    setInitiative("");
    setHp("");
  };

  return (
    <div className="h-full flex flex-col p-4 bg-transparent relative">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            <span>⚔️</span> Combate
          </h2>
          <button
            onClick={onOpenPartyModal}
            className="bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-xs px-2 py-1 rounded border border-blue-800"
          >
            🛡️ Grupo
          </button>
          <button
            onClick={onOpenEncounterModal}
            className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-xs px-2 py-1 rounded border border-purple-800"
          >
            📜 Encuentros
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase">Ronda</span>
          <span className="bg-gray-900 text-yellow-500 font-bold px-3 py-1 rounded border border-gray-600">
            {roundCount}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Añadir PJ/NPC..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 w-full text-white text-sm"
        />
        <input
          type="number"
          placeholder="Init"
          value={initiative}
          onChange={(e) => setInitiative(e.target.value)}
          className="bg-gray-700 rounded px-2 py-2 w-16 text-center text-white text-sm"
        />
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-600 px-4 rounded text-white font-bold text-lg"
        >
          +
        </button>
      </form>

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
            onUpdateInitiative={onUpdateInitiative}
          />
        ))}
      </div>

      {/* =========================================
          BOTONERA FLOTANTE CON CONFIRMACIONES
          ========================================= */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent flex gap-3 z-10">
        {/* BOTÓN PAPELERA (REINICIAR TODO) */}
        {confirmClearAll ? (
          <button
            onClick={() => {
              onReset();
              setConfirmClearAll(false);
            }}
            className="flex-grow bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg animate-pulse text-xs uppercase tracking-wider"
          >
            ⚠️ ¿BORRAR TODA LA MESA?
          </button>
        ) : (
          <button
            onClick={() => {
              setConfirmClearAll(true);
              setConfirmClearMonsters(false);
            }}
            className="bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-300 p-3 rounded-lg border border-gray-700 transition-all"
            title="Borrar TODO"
          >
            🗑️
          </button>
        )}

        {/* BOTÓN ESCOBA (LIMPIAR MONSTRUOS) */}
        {!confirmClearAll &&
          (confirmClearMonsters ? (
            <button
              onClick={() => {
                onClearMonsters();
                setConfirmClearMonsters(false);
              }}
              className="flex-grow bg-orange-700 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg animate-pulse text-xs uppercase tracking-wider"
            >
              ⚠️ ¿SÓLO LOS PJs?
            </button>
          ) : (
            <button
              onClick={() => {
                setConfirmClearMonsters(true);
                setConfirmClearAll(false);
              }}
              className="bg-gray-800 hover:bg-orange-900/50 text-gray-400 hover:text-orange-300 p-3 rounded-lg border border-gray-700 transition-all"
              title="Limpiar Monstruos"
            >
              🧹
            </button>
          ))}

        {/* BOTÓN SIGUIENTE TURNO (Sólo sale si no hay confirmaciones activas) */}
        {!confirmClearAll && !confirmClearMonsters && (
          <button
            onClick={onNextTurn}
            className="flex-grow btn-gold py-3 rounded-lg flex items-center justify-center gap-2 text-lg"
          >
            <span>Siguiente</span>
            <span className="text-xl">⏭️</span>
          </button>
        )}

        {/* BOTÓN CANCELAR (Si hay algo activo) */}
        {(confirmClearAll || confirmClearMonsters) && (
          <button
            onClick={() => {
              setConfirmClearAll(false);
              setConfirmClearMonsters(false);
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded-lg font-bold"
          >
            NO
          </button>
        )}
      </div>
    </div>
  );
};

export default CombatTracker;
