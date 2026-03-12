import React, { useState, useRef, useEffect } from "react";

// --- DICCIONARIO DE ESTADOS ---
const CONDITIONS = [
  {
    label: "Cegado",
    icon: "👁️‍🗨️",
    desc: "Falla pruebas de vista. Ataques contra él tienen ventaja, sus ataques tienen desventaja.",
  },
  {
    label: "Hechizado",
    icon: "😍",
    desc: "No puede atacar al hechizador. Ventaja en pruebas sociales contra él.",
  },
  {
    label: "Ensordecido",
    icon: "🙉",
    desc: "Falla pruebas de oído. No puede escuchar órdenes o ruidos ambientales.",
  },
  {
    label: "Asustado",
    icon: "😱",
    desc: "Desventaja en pruebas y ataques mientras vea la fuente de su miedo. No puede acercarse.",
  },
  {
    label: "Apresado",
    icon: "✊",
    desc: "Su velocidad es 0. No puede beneficiarse de bonos a la velocidad.",
  },
  {
    label: "Incapacitado",
    icon: "🤕",
    desc: "No puede realizar acciones ni reacciones de ningún tipo.",
  },
  {
    label: "Invisible",
    icon: "👻",
    desc: "Ventaja en sus ataques. Ataques contra él tienen desventaja. No puede ser visto.",
  },
  {
    label: "Paralizado",
    icon: "⚡",
    desc: "Incapacitado. No se mueve ni habla. Falla salvaciones de FUER/DES. Críticos a 1.5m.",
  },
  {
    label: "Petrificado",
    icon: "🗿",
    desc: "Se vuelve piedra. Incapacitado. Peso x10. Resistencia a todo el daño.",
  },
  {
    label: "Envenenado",
    icon: "🤢",
    desc: "Desventaja en tiradas de ataque y pruebas de característica.",
  },
  {
    label: "Derribado",
    icon: "🛌",
    desc: "Solo gatea. Desventaja en sus ataques. Ataques C/C contra él tienen ventaja.",
  },
  {
    label: "Restringido",
    icon: "⛓️",
    desc: "Velocidad 0. Ataques contra él con ventaja. Sus ataques y salvaciones DES con desventaja.",
  },
  {
    label: "Aturdido",
    icon: "💫",
    desc: "Incapacitado. No puede moverse. Falla salvaciones de FUER/DES. Ataques contra él con ventaja.",
  },
  {
    label: "Inconsciente",
    icon: "💤",
    desc: "Incapacitado. Suelta todo y cae. Falla salvaciones FUER/DES. Críticos a 1.5m.",
  },
];

// --- SUB-COMPONENTE TOOLTIP ---
const StateTooltip = ({ info, children, direction = "up" }) => {
  const isUp = direction === "up";
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div
        className={`pointer-events-none absolute ${isUp ? "bottom-full mb-2" : "top-full mt-2"} left-1/2 -translate-x-1/2 hidden group-hover:block w-44 bg-gray-950 border border-yellow-600/50 p-2.5 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.9)] z-[200] animate-fade-in`}
      >
        <div className="text-yellow-500 font-bold text-[11px] border-b border-gray-800 mb-1.5 pb-1 flex justify-between uppercase">
          <span>{info?.label}</span>
          <span>{info?.icon}</span>
        </div>
        <p className="text-[10px] text-gray-300 leading-tight italic">
          {info?.desc}
        </p>
        <div
          className={`absolute left-1/2 -translate-x-1/2 border-[6px] border-transparent ${isUp ? "top-full border-t-gray-950" : "bottom-full border-b-gray-950"}`}
        ></div>
      </div>
    </div>
  );
};

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

  // MAGIA DEL AUTO-SCROLL (Mantenido)
  const rowRef = useRef(null);
  useEffect(() => {
    if (isActive && rowRef.current) {
      setTimeout(() => {
        rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [isActive]);

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
      if (editingField === "ac" || editingField === "maxHp")
        onUpdateStats(combatant.id, editingField, val);
      else if (editingField === "initiative")
        onUpdateInitiative(combatant.id, val);
    }
    setEditingField(null);
  };

  const activeStyle = isActive
    ? "border-l-4 border-yellow-400 bg-gray-700 shadow-[0_0_20px_rgba(234,179,8,0.2)] z-[60] scale-[1.01]"
    : "border-l-4 border-gray-600 bg-gray-800/50 hover:bg-gray-700 hover:z-[50] opacity-90 transition-all";

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
      ref={rowRef}
      className={`p-2.5 rounded mb-2 relative transition-all duration-300 ${activeStyle}`}
    >
      {isActive && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-gray-900 text-[9px] font-bold px-3 py-0.5 rounded-b-lg z-[70] shadow-md">
          TURNO ACTIVO
        </div>
      )}

      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          {/* Iniciativa legible */}
          <div className="flex flex-col items-center min-w-[36px] cursor-pointer">
            {editingField === "initiative" ? (
              <input
                autoFocus
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                className="w-10 bg-gray-900 text-yellow-400 font-bold text-center rounded focus:outline-none ring-1 ring-yellow-500 text-base"
              />
            ) : (
              <div
                onClick={() => startEditing("initiative", combatant.initiative)}
                className="flex flex-col items-center"
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
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`font-bold text-lg truncate leading-tight ${isActive ? "text-white" : "text-gray-300"}`}
              >
                {combatant.name}
              </span>
              {combatant.apiIndex && (
                <button
                  onClick={() =>
                    onViewStatBlock(combatant.apiIndex, combatant.localData)
                  }
                  className="text-gray-400 hover:text-yellow-400 text-sm mx-1"
                  title="Ver Ficha"
                >
                  👁️
                </button>
              )}
              <div
                className="flex items-center gap-1 bg-gray-900/60 px-2 py-0.5 rounded border border-gray-700 cursor-pointer"
                onClick={() => startEditing("ac", combatant.ac)}
              >
                <span className="text-[10px]">🛡️</span>
                {editingField === "ac" ? (
                  <input
                    autoFocus
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
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
                className={`text-[10px] px-2 py-0.5 rounded border font-bold ${showConditions ? "bg-yellow-600 border-yellow-400 text-white" : "text-gray-500 border-gray-700 hover:text-white"}`}
              >
                +FX
              </button>
            </div>

            {/* Barra de vida */}
            {combatant.hp > 0 ? (
              <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div
                  className={`h-full ${hpPercent <= 20 ? "bg-red-500" : hpPercent <= 50 ? "bg-yellow-500" : "bg-green-500"} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
                ></div>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between bg-gray-950/50 p-1 rounded border border-red-900/30">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-green-500 font-bold uppercase">
                    Éxito
                  </span>
                  <DeathSaveSelector
                    type="success"
                    count={combatant.deathSaves?.success || 0}
                    color="bg-green-500"
                  />
                </div>
                <div className="w-px h-3 bg-gray-800"></div>
                <div className="flex items-center gap-2">
                  <DeathSaveSelector
                    type="failure"
                    count={combatant.deathSaves?.failure || 0}
                    color="bg-red-600"
                  />
                  <span className="text-[9px] text-red-500 font-bold uppercase">
                    Fallo
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs flex items-center font-mono ${combatant.hp === 0 ? "text-red-500" : "text-gray-400"}`}
              >
                HP: {combatant.hp} /
                {editingField === "maxHp" ? (
                  <input
                    autoFocus
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
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

              <div className="flex gap-1 flex-wrap">
                {combatant.conditions?.map((icon, i) => {
                  const info = CONDITIONS.find((c) => c.icon === icon);
                  return (
                    <StateTooltip key={i} info={info} direction="up">
                      <span className="text-sm cursor-help hover:scale-125 transition-transform">
                        {icon}
                      </span>
                    </StateTooltip>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Botones HP tamaño normal */}
        <div className="flex items-center gap-1 shrink-0 bg-gray-950/40 p-1 rounded-lg border border-gray-800/50">
          <button
            onPointerDown={() => startDelta(-1)}
            onPointerUp={stopDelta}
            onPointerLeave={stopDelta}
            className="w-8 h-8 flex items-center justify-center bg-red-900/30 hover:bg-red-600 text-red-200 rounded font-bold select-none text-lg"
            style={{ touchAction: "none" }}
          >
            -
          </button>
          <input
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="1"
            className="w-10 h-8 bg-gray-900 text-center text-white rounded text-sm outline-none border border-gray-700"
          />
          <button
            onPointerDown={() => startDelta(1)}
            onPointerUp={stopDelta}
            onPointerLeave={stopDelta}
            className="w-8 h-8 flex items-center justify-center bg-green-900/30 hover:bg-green-600 text-green-200 rounded font-bold select-none text-lg"
            style={{ touchAction: "none" }}
          >
            +
          </button>
          <button
            onClick={() => onRemove(combatant.id)}
            className="ml-1 text-gray-600 hover:text-red-400 p-1"
          >
            ✕
          </button>
        </div>
      </div>

      {showConditions && (
        <div className="mt-2 p-2 bg-gray-950/90 rounded-lg grid grid-cols-7 gap-1 animate-fade-in border border-gray-800 shadow-xl relative z-[80]">
          {CONDITIONS.map((cond) => (
            <StateTooltip key={cond.label} info={cond} direction="down">
              <button
                onClick={() => {
                  onToggleCondition(combatant.id, cond.icon);
                  setShowConditions(false);
                }}
                className={`text-xl p-2 rounded hover:bg-gray-800 transition-all ${combatant.conditions?.includes(cond.icon) ? "bg-blue-900/40 ring-1 ring-blue-500 scale-90" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
              >
                {cond.icon}
              </button>
            </StateTooltip>
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
  onUpdateInitiative,
  onClearMonsters,
}) => {
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");
  const [hp, setHp] = useState("");

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
    // ESTRUCTURA ANTI-SCROLL: h-full flex flex-col (Sin relative ni overflow raro)
    <div className="h-full flex flex-col p-4 bg-transparent">
      {/* HEADER (No se encoge) */}
      <div className="flex-none flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-1 tracking-wide">
            <span>⚔️</span> Combate
          </h2>
          <button
            onClick={onOpenPartyModal}
            className="bg-blue-900/40 hover:bg-blue-800 text-blue-200 text-[10px] uppercase font-bold px-2 py-1 rounded border border-blue-800 flex items-center gap-1 transition-colors"
          >
            🛡️ Grupo
          </button>
          <button
            onClick={onOpenEncounterModal}
            className="bg-purple-900/40 hover:bg-purple-800 text-purple-200 text-[10px] uppercase font-bold px-2 py-1 rounded border border-purple-800 flex items-center gap-1 transition-colors"
          >
            📜 Encuentros
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold">
            Ronda
          </span>
          <span className="bg-gray-900 text-yellow-500 font-bold px-2 py-1 rounded border border-gray-700 text-sm">
            {roundCount}
          </span>
        </div>
      </div>

      {/* FORMULARIO (No se encoge) */}
      <form onSubmit={handleSubmit} className="flex-none flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Añadir PJ/NPC..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
        <input
          type="number"
          placeholder="Init"
          value={initiative}
          onChange={(e) => setInitiative(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-2 w-16 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-600 px-4 rounded text-white font-bold text-lg leading-none transition-all transform active:scale-95"
        >
          +
        </button>
      </form>

      {/* LISTA (Esta es la que hace SCROLL. Con min-h-0 le decimos que no desborde la pantalla) */}
      <div className="flex-grow overflow-y-auto custom-scrollbar px-2 pt-4 pb-2 space-y-2 min-h-0">
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

      {/* FOOTER (Fijo abajo, pero DENTRO del layout, sin romper la página) */}
      <div className="flex-none flex gap-3 mt-4 pt-2 border-t border-gray-800">
        {confirmClearAll ? (
          <button
            onClick={() => {
              onReset();
              setConfirmClearAll(false);
            }}
            className="flex-grow bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg animate-pulse text-xs uppercase tracking-wider"
          >
            ⚠️ ¿BORRAR TODA LA MESA?
          </button>
        ) : (
          <button
            onClick={() => {
              setConfirmClearAll(true);
              setConfirmClearMonsters(false);
            }}
            className="bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-300 p-3 rounded-xl border border-gray-700 transition-all"
            title="Borrar TODO"
          >
            🗑️
          </button>
        )}

        {!confirmClearAll &&
          (confirmClearMonsters ? (
            <button
              onClick={() => {
                onClearMonsters();
                setConfirmClearMonsters(false);
              }}
              className="flex-grow bg-orange-700 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg animate-pulse text-xs uppercase tracking-wider"
            >
              ⚠️ ¿SÓLO LOS PJs?
            </button>
          ) : (
            <button
              onClick={() => {
                setConfirmClearMonsters(true);
                setConfirmClearAll(false);
              }}
              className="bg-gray-800 hover:bg-orange-900/50 text-gray-400 hover:text-orange-300 p-3 rounded-xl border border-gray-700 transition-all"
              title="Limpiar Monstruos"
            >
              🧹
            </button>
          ))}

        {!confirmClearAll && !confirmClearMonsters && (
          <button
            onClick={onNextTurn}
            className="flex-grow bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 font-black shadow-lg transition-transform active:scale-95"
          >
            <span>Siguiente Turno</span>
            <span className="text-xl">⏭️</span>
          </button>
        )}

        {(confirmClearAll || confirmClearMonsters) && (
          <button
            onClick={() => {
              setConfirmClearAll(false);
              setConfirmClearMonsters(false);
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white px-5 rounded-xl font-bold"
          >
            NO
          </button>
        )}
      </div>
    </div>
  );
};

export default CombatTracker;
