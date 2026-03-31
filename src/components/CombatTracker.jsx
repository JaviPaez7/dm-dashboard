import React, { useState, useRef, useEffect } from "react";

const CONDITIONS = [
  { label: "Cegado", icon: "👁️‍🗨️", desc: "Falla pruebas de vista. Ataques contra él tienen ventaja, sus ataques tienen desventaja." },
  { label: "Hechizado", icon: "😍", desc: "No puede atacar al hechizador. Ventaja en pruebas sociales contra él." },
  { label: "Ensordecido", icon: "🙉", desc: "Falla pruebas de oído. No puede escuchar órdenes o ruidos ambientales." },
  { label: "Asustado", icon: "😱", desc: "Desventaja en pruebas y ataques mientras vea la fuente de su miedo. No puede acercarse." },
  { label: "Apresado", icon: "✊", desc: "Su velocidad es 0. No puede beneficiarse de bonos a la velocidad." },
  { label: "Incapacitado", icon: "🤕", desc: "No puede realizar acciones ni reacciones de ningún tipo." },
  { label: "Invisible", icon: "👻", desc: "Ventaja en sus ataques. Ataques contra él tienen desventaja. No puede ser visto." },
  { label: "Paralizado", icon: "⚡", desc: "Incapacitado. No se mueve ni habla. Falla salvaciones de FUER/DES. Críticos a 1.5m." },
  { label: "Petrificado", icon: "🗿", desc: "Se vuelve piedra. Incapacitado. Peso x10. Resistencia a todo el daño." },
  { label: "Envenenado", icon: "🤢", desc: "Desventaja en tiradas de ataque y pruebas de característica." },
  { label: "Derribado", icon: "🛌", desc: "Solo gatea. Desventaja en sus ataques. Ataques C/C contra él tienen ventaja." },
  { label: "Restringido", icon: "⛓️", desc: "Velocidad 0. Ataques contra él con ventaja. Sus ataques y salvaciones DES con desventaja." },
  { label: "Aturdido", icon: "💫", desc: "Incapacitado. No puede moverse. Falla salvaciones de FUER/DES. Ataques contra él con ventaja." },
  { label: "Inconsciente", icon: "💤", desc: "Incapacitado. Suelta todo y cae. Falla salvaciones FUER/DES. Críticos a 1.5m." },
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
  onHealCombatant,
}) => {
  const [delta, setDelta] = useState("");
  const [showConditions, setShowConditions] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [hoveredMenuCond, setHoveredMenuCond] = useState(null);
  const [expandedCondition, setExpandedCondition] = useState(null);

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
  useEffect(() => { deltaRef.current = delta; }, [delta]);

  const startDelta = (multiplier) => {
    const amount = deltaRef.current === "" ? 1 : parseInt(deltaRef.current);
    if (isNaN(amount)) return;
    
    // Aplica el primer golpe (podría ser 10, 5, o 1 si está vacío)
    onUpdateHP(combatant.id, amount * multiplier);
    
    // Empieza el intervalo repitiendo de 1 en 1 como antes
    intervalRef.current = setInterval(() => {
      onUpdateHP(combatant.id, multiplier);
    }, 150);
  };

  const stopDelta = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDelta(""); // Resetea a "" para que se vea el placeholder "1"
  };

  const hpPercent = (combatant.hp / combatant.maxHp) * 100;

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editValue !== "" && !isNaN(editValue)) {
      const val = parseInt(editValue);
      if (editingField === "ac") {
        onUpdateStats(combatant.id, "ac", val);
      } else if (editingField === "maxHp") {
        onUpdateStats(combatant.id, "maxHp", val);
        onUpdateStats(combatant.id, "hp", val); // Llena la vida al nuevo máximo
      } else if (editingField === "initiative") {
        onUpdateInitiative(combatant.id, val);
      }
    }
    setEditingField(null);
  };

  const activeStyle = isActive
    ? "border-l-4 border-yellow-400 bg-gray-700 shadow-md"
    : combatant.hp === 0
    ? "border-l-4 border-red-900 bg-gray-900/80 opacity-60"
    : "border-l-4 border-gray-600 bg-gray-800/50 opacity-90 transition-colors";

  const DeathSaveSelector = ({ type, count, color }) => (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          onClick={() => onUpdateDeathSaves(combatant.id, type, i === count ? i - 1 : i)}
          className={`w-4 h-4 lg:w-3 lg:h-3 rounded-full border border-gray-500 cursor-pointer ${i <= count ? color : "bg-gray-800"} hover:scale-125 transition-transform`}
        ></div>
      ))}
    </div>
  );

  return (
    <div ref={rowRef} className={`p-1.5 lg:p-2.5 rounded mb-2 relative ${activeStyle}`}>
      {isActive && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-gray-900 text-[9px] font-bold px-3 py-0.5 rounded-b-lg shadow-md z-10">
          TURNO ACTIVO
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-2">
        <div className="flex items-start lg:items-center gap-2 w-full lg:w-auto lg:flex-grow min-w-0">
          
          <div className="flex flex-col items-center shrink-0 min-w-[32px] cursor-pointer">
            {editingField === "initiative" ? (
              <input
                autoFocus 
                type="number" 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)} 
                onBlur={saveEdit} 
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                className="w-8 bg-gray-900 text-yellow-400 font-bold text-center rounded focus:outline-none ring-1 ring-yellow-500 text-sm"
              />
            ) : (
              <div onClick={() => startEditing("initiative", combatant.initiative)} className="flex flex-col items-center">
                <span className={`font-bold text-lg lg:text-xl leading-none ${isActive ? "text-yellow-400" : "text-gray-500"}`}>
                  {combatant.initiative}
                </span>
                <span className="text-[8px] text-gray-500 uppercase mt-0.5 font-bold">Init</span>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full min-w-0 gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-base lg:text-lg truncate flex-grow leading-tight ${
                isActive ? "text-white" : combatant.hp === 0 ? "text-red-500 line-through" : "text-gray-300"
              }`}>
                {combatant.name}
              </span>

              {combatant.apiIndex && (
                <button 
                  onClick={() => onViewStatBlock(combatant.apiIndex, combatant.localData)} 
                  className="text-gray-400 hover:text-yellow-400 text-sm mx-0.5"
                >
                  👁️
                </button>
              )}

              <div className="flex items-center gap-1 bg-gray-900/60 px-1.5 py-0.5 rounded border border-gray-700 cursor-pointer" onClick={() => startEditing("ac", combatant.ac)}>
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
                  <span className="text-xs font-bold text-blue-300">{combatant.ac || 10}</span>
                )}
              </div>

              <button 
                onClick={() => setShowConditions(!showConditions)} 
                className={`text-[9px] lg:text-[10px] px-1.5 py-0.5 rounded border font-bold ${showConditions ? "bg-yellow-600 border-yellow-400 text-white" : "text-gray-500 border-gray-700 hover:text-white"}`}
              >
                +FX
              </button>
            </div>

            {combatant.hp > 0 ? (
              <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className={`h-full ${hpPercent <= 20 ? "bg-red-500" : hpPercent <= 50 ? "bg-yellow-500" : "bg-green-500"} transition-all duration-500`} 
                  style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
                ></div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-950/50 p-1 rounded border border-red-900/30">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-green-500 font-bold uppercase">Éxito</span> 
                  <DeathSaveSelector type="success" count={combatant.deathSaves?.success || 0} color="bg-green-500" />
                </div>
                <div className="w-px h-3 bg-gray-800"></div>
                <div className="flex items-center gap-1.5">
                  <DeathSaveSelector type="failure" count={combatant.deathSaves?.failure || 0} color="bg-red-600" /> 
                  <span className="text-[8px] text-red-500 font-bold uppercase">Fallo</span>
                </div>
              </div>
            )}
            
            {combatant.conditions?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {combatant.conditions.map((icon, i) => (
                  <button 
                    key={i} 
                    onClick={() => setExpandedCondition(expandedCondition === icon ? null : icon)} 
                    className="text-sm cursor-help hover:scale-125 transition-transform outline-none"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between w-full lg:w-auto bg-gray-950/40 p-1 lg:p-1.5 rounded-lg border border-gray-800/50">
          <span className={`text-xs flex items-center font-mono font-bold mr-2 lg:mr-3 ${combatant.hp === 0 ? "text-red-500" : "text-gray-400"}`}>
            HP:{combatant.hp}/
            {editingField === "maxHp" ? (
              <input 
                autoFocus 
                type="number" 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)} 
                onBlur={saveEdit} 
                onKeyDown={(e) => e.key === "Enter" && saveEdit()} 
                className="w-8 bg-gray-800 text-center rounded text-xs ml-0.5" 
              />
            ) : (
              <span 
                onClick={() => startEditing("maxHp", combatant.maxHp)} 
                className="ml-0.5 cursor-pointer hover:underline text-gray-300"
              >
                {combatant.maxHp}
              </span>
            )}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onPointerDown={() => startDelta(-1)} 
              onPointerUp={stopDelta} 
              onPointerLeave={stopDelta} 
              className="w-8 h-8 lg:w-8 lg:h-8 flex items-center justify-center bg-red-900/30 hover:bg-red-600 active:bg-red-600 text-red-200 rounded font-bold text-lg" 
              style={{ touchAction: "none" }}
            >-</button>
            <input 
              type="number" 
              value={delta} 
              onChange={(e) => setDelta(e.target.value)} 
              placeholder="1" 
              className="w-10 h-8 lg:w-10 lg:h-8 bg-gray-900 text-center text-white rounded text-sm outline-none border border-gray-700 font-bold" 
            />
            <button 
              onPointerDown={() => startDelta(1)} 
              onPointerUp={stopDelta} 
              onPointerLeave={stopDelta} 
              className="w-8 h-8 lg:w-8 lg:h-8 flex items-center justify-center bg-green-900/30 hover:bg-green-600 active:bg-green-600 text-green-200 rounded font-bold text-lg" 
              style={{ touchAction: "none" }}
            >+</button>
            <button
              onClick={() => onHealCombatant(combatant.id)}
              disabled={combatant.hp >= combatant.maxHp}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-all ${
                combatant.hp >= combatant.maxHp 
                  ? "text-gray-600 opacity-20 cursor-default" 
                  : "bg-blue-900/30 hover:bg-blue-600 active:bg-blue-600 text-blue-200"
              }`}
              title="Curar al máximo"
            >⛑️</button>
            <button 
              onClick={() => onRemove(combatant.id)} 
              className="ml-1 lg:ml-2 text-gray-500 hover:text-red-400 active:text-red-400 p-1 text-base"
            >✕</button>
          </div>
        </div>
      </div>

      {expandedCondition && (
        <div className="mt-2 p-2 bg-gray-950/80 rounded border border-yellow-600/30 text-left animate-fade-in w-full shadow-inner">
          {(() => {
            const info = CONDITIONS.find((c) => c.icon === expandedCondition);
            return info ? (
              <>
                <div className="text-yellow-500 font-bold text-[10px] uppercase mb-0.5">{info.label} {info.icon}</div>
                <div className="text-[9px] text-gray-300 italic leading-tight">{info.desc}</div>
              </>
            ) : null;
          })()}
        </div>
      )}

      {showConditions && (
        <div className="mt-2 p-1.5 bg-gray-950/90 rounded-lg border border-gray-800 shadow-inner">
          <div className="grid grid-cols-7 gap-1">
            {CONDITIONS.map((cond) => (
              <button 
                key={cond.label} 
                onClick={() => { onToggleCondition(combatant.id, cond.icon); setShowConditions(false); setHoveredMenuCond(null); }} 
                onMouseEnter={() => setHoveredMenuCond(cond)} 
                onMouseLeave={() => setHoveredMenuCond(null)} 
                className={`text-xl lg:text-xl p-1 rounded hover:bg-gray-800 transition-all ${combatant.conditions?.includes(cond.icon) ? "bg-blue-900/40 ring-1 ring-blue-500 scale-90" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
              >
                {cond.icon}
              </button>
            ))}
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-gray-800 h-[35px] lg:h-[45px] flex flex-col justify-center">
            {hoveredMenuCond ? (
              <div className="animate-fade-in text-left">
                <span className="text-yellow-500 font-bold text-[9px] lg:text-[10px] uppercase block leading-none">{hoveredMenuCond.label} {hoveredMenuCond.icon}</span>
                <span className="text-[8px] lg:text-[9px] text-gray-300 italic mt-0.5 block leading-tight">{hoveredMenuCond.desc}</span>
              </div>
            ) : (
              <span className="text-[8px] lg:text-[9px] text-gray-600 italic text-center block">Toca un estado para aplicar.</span>
            )}
          </div>
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
  onHealCombatant,
  shareLink,
  onCopyLink,
}) => {
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");
  const [hp, setHp] = useState("");

  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmClearMonsters, setConfirmClearMonsters] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

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
    <div className="h-full flex flex-col p-2 lg:p-4 bg-transparent w-full">
      
      {/* HEADER */}
      <div className="shrink-0 flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-lg lg:text-2xl font-bold text-red-400 flex items-center gap-1 tracking-wide">
            <span>⚔️</span> <span className="hidden sm:inline">Combate</span>
          </h2>
          <button 
            onClick={onOpenPartyModal} 
            className="bg-blue-900/40 hover:bg-blue-800 text-blue-200 text-[9px] lg:text-xs uppercase font-bold px-2 py-1.5 rounded border border-blue-800 flex items-center gap-1"
          >
            🛡️ Grupo
          </button>
          <button 
            onClick={onOpenEncounterModal} 
            className="bg-purple-900/40 hover:bg-purple-800 text-purple-200 text-[9px] lg:text-xs uppercase font-bold px-2 py-1.5 rounded border border-purple-800 flex items-center gap-1"
          >
            📜 Encuentros
          </button>
        </div>
        <div className="flex items-center gap-1 bg-gray-900/80 px-2 py-1 rounded-lg border border-gray-700">
          <span className="text-[9px] lg:text-xs text-gray-400 uppercase font-bold">Ronda</span>
          <span className="text-yellow-500 font-bold text-sm lg:text-base">{roundCount}</span>
        </div>
        
        {shareLink && (
          <button 
            onClick={onCopyLink}
            className="ml-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] lg:text-xs font-bold px-2 py-1.5 rounded border border-gray-700 flex items-center gap-1 transition-colors"
            title="Copiar enlace para jugadores"
          >
            🔗 <span className="hidden sm:inline">Compartir</span>
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="shrink-0 flex gap-1.5 mb-2">
        <input 
          type="text" 
          placeholder="Añadir PJ/NPC..." 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 w-full text-white text-xs lg:text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500" 
        />
        <input 
          type="number" 
          placeholder="Init" 
          value={initiative} 
          onChange={(e) => setInitiative(e.target.value)} 
          className="bg-gray-800 border border-gray-700 rounded px-1.5 py-1.5 w-12 lg:w-16 text-center text-white text-xs lg:text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500" 
        />
        <button 
          type="submit" 
          className="bg-green-700 hover:bg-green-600 px-3 rounded text-white font-bold text-base transition-all active:scale-95"
        >
          +
        </button>
      </form>

      {/* LISTA DE COMBATIENTES (Aquí está la magia del scroll interno) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pt-4 pb-2 min-h-0">
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
            onHealCombatant={onHealCombatant}
          />
        ))}
      </div>

      {/* FOOTER PEGAJOSO (Siguiente Turno) */}
      <div className="shrink-0 flex gap-2 mt-2 pt-2 pb-1 border-t border-gray-800 bg-[#161b22]/95 lg:bg-transparent z-20 relative">
        
        {/* Botón menú borrar unificado */}
        {!confirmClearAll && !confirmClearMonsters && (
          <div className="relative">
            <button
              onClick={() => setShowDeleteMenu(v => !v)}
              className="bg-gray-800 text-gray-400 p-3 rounded-lg border border-gray-700 hover:border-gray-500"
              title="Opciones de borrado"
            >
              🗑️
            </button>
            {showDeleteMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-30 flex flex-col min-w-[160px] animate-fade-in">
                <button
                  onClick={() => { setConfirmClearMonsters(true); setShowDeleteMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-xs text-orange-300 hover:bg-gray-800 text-left"
                >
                  🧹 <span>Limpiar monstruos</span>
                </button>
                <div className="h-px bg-gray-700" />
                <button
                  onClick={() => { setConfirmClearAll(true); setShowDeleteMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-gray-800 text-left"
                >
                  🗑️ <span>Borrar todo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {confirmClearAll && (
          <button 
            onClick={() => { onReset(); setConfirmClearAll(false); }} 
            className="flex-grow bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg animate-pulse text-[10px] lg:text-sm uppercase tracking-wider"
          >
            ⚠️ ¿Borrar Mesa?
          </button>
        )}

        {confirmClearMonsters && (
          <button 
            onClick={() => { onClearMonsters(); setConfirmClearMonsters(false); }} 
            className="flex-grow bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg animate-pulse text-[10px] lg:text-sm uppercase tracking-wider"
          >
            ⚠️ ¿Sólo PJs?
          </button>
        )}

        {!confirmClearAll && !confirmClearMonsters && (
          <button 
            onClick={onNextTurn} 
            className="flex-grow bg-gradient-to-r from-yellow-700 to-yellow-600 text-gray-900 py-3 rounded-lg flex items-center justify-center gap-2 font-black shadow-lg transition-transform active:scale-95"
          >
            <span className="text-xs lg:text-base uppercase tracking-widest">Siguiente Turno</span>
            <span className="text-lg lg:text-xl">⏭️</span>
          </button>
        )}

        {(confirmClearAll || confirmClearMonsters) && (
          <button 
            onClick={() => { setConfirmClearAll(false); setConfirmClearMonsters(false); }} 
            className="bg-gray-700 text-white px-4 rounded-lg font-bold"
          >
            NO
          </button>
        )}
      </div>
    </div>
  );
};

export default CombatTracker;