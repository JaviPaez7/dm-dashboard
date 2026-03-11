import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import CombatTracker from "./components/CombatTracker";
import MonsterSearch from "./components/MonsterSearch";
import SpellSearch from "./components/SpellSearch";
import DiceRoller from "./components/DiceRoller";
import PartyModal from "./components/PartyModal";
import StatBlockModal from "./components/StatBlockModal";
import Soundboard from "./components/Soundboard";
import Notepad from "./components/Notepad";
import EncounterModal from "./components/EncounterModal";

function App() {
  // --- 1. ESTADOS BASE ---
  const [combatants, setCombatants] = useState(() => {
    const saved = localStorage.getItem("dm_dashboard_combatants");
    return saved ? JSON.parse(saved) : [];
  });
  const [party, setParty] = useState(() => {
    const saved = localStorage.getItem("dm_dashboard_party");
    return saved ? JSON.parse(saved) : [];
  });

  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [roundCount, setRoundCount] = useState(1);

  // --- 2. ESTADOS DE PESTAÑAS ---
  const [activeTab, setActiveTab] = useState("monsters");
  const [activeRightTab, setActiveRightTab] = useState("dice");

  // --- 3. ESTADO DEL VISOR DE FICHAS (EL OJO) ---
  const [viewingMonsterIndex, setViewingMonsterIndex] = useState(null);
  const [viewingMonsterData, setViewingMonsterData] = useState(null);

  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);
  // --- PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem("dm_dashboard_combatants", JSON.stringify(combatants));
  }, [combatants]);
  useEffect(() => {
    localStorage.setItem("dm_dashboard_party", JSON.stringify(party));
  }, [party]);

  // --- FUNCIONES DE COMBATE ---
  const addCombatant = (newCombatant) => {
    setCombatants((prev) =>
      [...prev, { ...newCombatant, id: Date.now() }].sort(
        (a, b) => b.initiative - a.initiative,
      ),
    );
  };

  // 1. Función para actualizar la iniciativa y reordenar la lista
  const updateInitiative = (id, newInitiative) => {
    setCombatants((prev) => {
      // Actualizamos la iniciativa del personaje tocado
      const updated = prev.map((c) =>
        c.id === id ? { ...c, initiative: newInitiative } : c,
      );
      // Y volvemos a ordenar la lista de mayor a menor
      return updated.sort((a, b) => b.initiative - a.initiative);
    });
  };

  // 2. Función para borrar solo a los monstruos (los que vienen del bestiario)
  const clearMonsters = () => {
    // Asumimos que los monstruos tienen "apiIndex" (porque vienen del bestiario)
    // y los jugadores no. Así que nos quedamos solo con los que NO tienen apiIndex.
    setCombatants((prev) => prev.filter((c) => !c.apiIndex));

    // Opcional: Reiniciar el turno a 0 y la ronda a 1 para el próximo combate
    setCurrentTurnIndex(0);
    setRoundCount(1);
  };

  const removeCombatant = (id) =>
    setCombatants((prev) => prev.filter((c) => c.id !== id));
  const updateHP = (id, delta) =>
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, hp: Math.max(0, c.hp + delta) } : c,
      ),
    );
  const updateCombatantStats = (id, field, value) =>
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: parseInt(value) } : c)),
    );
  const updateDeathSaves = (id, type, value) =>
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              deathSaves: {
                ...(c.deathSaves || { success: 0, failure: 0 }),
                [type]: value,
              },
            }
          : c,
      ),
    );

  const toggleCondition = (id, icon) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const conds = c.conditions || [];
        return {
          ...c,
          conditions: conds.includes(icon)
            ? conds.filter((i) => i !== icon)
            : [...conds, icon],
        };
      }),
    );
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    if (currentTurnIndex >= combatants.length - 1) {
      setCurrentTurnIndex(0);
      setRoundCount((r) => r + 1);
    } else {
      setCurrentTurnIndex((prev) => prev + 1);
    }
  };
  const resetEncounter = () => {
    if (confirm("¿Limpiar mesa?")) {
      setCombatants([]);
      setRoundCount(1);
      setCurrentTurnIndex(0);
    }
  };

  // --- LÓGICA INTELIGENTE DE MONSTRUOS ---
  const addMonsterToCombat = (incomingData) => {
    const data = incomingData.data || incomingData;
    const isLocal = !!data.stats;

    const dex = isLocal ? data.stats?.dex : data.dexterity;
    const hp = isLocal ? data.hp : data.hit_points;
    const ac = isLocal ? data.ac : data.armor_class?.[0]?.value;

    const safeDex = dex || 10;
    const finalHp = hp || 10;
    const finalAc = ac || 10;

    const dexMod = Math.floor((safeDex - 10) / 2);
    const rolledInit = Math.floor(Math.random() * 20) + 1 + dexMod;

    addCombatant({
      name: data.name || "Criatura",
      apiIndex: data.index,
      isLocal: isLocal,
      localData: isLocal ? data : null,
      initiative: rolledInit,
      hp: finalHp,
      maxHp: finalHp,
      ac: finalAc,
      conditions: [],
      deathSaves: { success: 0, failure: 0 },
    });
  };

  // --- FUNCIONES DE GRUPO ---
  const savePartyMember = (m) => setParty([...party, m]);
  const deletePartyMember = (id) => setParty(party.filter((p) => p.id !== id));
  const addPartyMemberToCombat = (m) => {
    const initStr = prompt(`Iniciativa para ${m.name}:`, "0");
    if (initStr === null) return;
    addCombatant({
      ...m,
      initiative: parseInt(initStr) || 0,
      conditions: [],
      id: Date.now(),
    });
  };
  const addMultipleCombatants = (squad) =>
    setCombatants((prev) =>
      [...prev, ...squad].sort((a, b) => b.initiative - a.initiative),
    );

  // --- FUNCIÓN DEL VISOR (¡ESTE ERA EL CABLE QUE FALTABA CONECTAR!) ---
  const handleViewStatBlock = (index, data = null) => {
    setViewingMonsterIndex(index);
    setViewingMonsterData(data);
  };

  // Cargar encuentro guardado
  const loadEncounter = (savedMonsters) => {
    if (!confirm("¿Cargar este encuentro? (Se añadirán a la mesa actual)"))
      return;

    const newCombatants = savedMonsters.map((m) => {
      // Recalculamos iniciativa para que no sea siempre la misma
      const dex = m.isLocal
        ? m.localData?.stats?.dex
        : m.localData?.dexterity || 10;
      const safeDex = dex || 10;
      const dexMod = Math.floor((safeDex - 10) / 2);
      const rolledInit = Math.floor(Math.random() * 20) + 1 + dexMod;

      return {
        ...m,
        id: Date.now() + Math.random(), // ID único nuevo
        initiative: rolledInit,
        hp: m.maxHp, // Aseguramos vida llena
      };
    });

    setCombatants((prev) =>
      [...prev, ...newCombatants].sort((a, b) => b.initiative - a.initiative),
    );
  };

  return (
    <Layout>
      {/* --- COLUMNA 1: IZQUIERDA (COMBATE) --- */}
      <CombatTracker
        combatants={combatants}
        onAdd={addCombatant}
        onRemove={removeCombatant}
        onUpdateHP={updateHP}
        onToggleCondition={toggleCondition}
        currentTurnIndex={currentTurnIndex}
        roundCount={roundCount}
        onNextTurn={nextTurn}
        onReset={resetEncounter}
        onOpenPartyModal={() => setIsPartyModalOpen(true)}
        onUpdateStats={updateCombatantStats}
        onUpdateDeathSaves={updateDeathSaves}
        onViewStatBlock={handleViewStatBlock}
        onOpenEncounterModal={() => setIsEncounterModalOpen(true)}
        onUpdateInitiative={updateInitiative}
        onClearMonsters={clearMonsters}
      />

      {/* --- COLUMNA 2: CENTRO (PESTAÑAS) --- */}
      <div className="flex flex-col h-full">
        <div className="flex mb-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setActiveTab("monsters")}
            className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${activeTab === "monsters" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
          >
            🐉 Bestiario
          </button>
          <button
            onClick={() => setActiveTab("spells")}
            className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${activeTab === "spells" ? "bg-purple-600 text-white shadow" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
          >
            ✨ Grimorio
          </button>
        </div>
        <div className="flex-grow overflow-hidden">
          {activeTab === "monsters" ? (
            <MonsterSearch
              onAddMonster={addMonsterToCombat}
              onViewStatBlock={handleViewStatBlock} // <-- CABLE CONECTADO AQUÍ
            />
          ) : (
            <SpellSearch />
          )}
        </div>
      </div>

      {/* --- COLUMNA 3: DERECHA (PESTAÑAS MULTIFUNCIÓN) --- */}
      <div className="flex flex-col h-full">
        <div className="flex mb-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setActiveRightTab("dice")}
            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${activeRightTab === "dice" ? "bg-yellow-600 text-black shadow" : "text-gray-400 hover:text-white"}`}
          >
            🎲
          </button>
          <button
            onClick={() => setActiveRightTab("sound")}
            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${activeRightTab === "sound" ? "bg-pink-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            🎵
          </button>
          <button
            onClick={() => setActiveRightTab("notes")}
            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${activeRightTab === "notes" ? "bg-gray-200 text-black shadow" : "text-gray-400 hover:text-white"}`}
          >
            📜
          </button>
        </div>
        <div className="flex-grow overflow-hidden">
          {activeRightTab === "dice" && <DiceRoller />}
          {activeRightTab === "sound" && <Soundboard />}
          {activeRightTab === "notes" && <Notepad />}
        </div>
      </div>

      {/* --- MODALES INVISIBLES --- */}
      <PartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        party={party}
        onSavePartyMember={savePartyMember}
        onDeletePartyMember={deletePartyMember}
        onAddToCombat={addPartyMemberToCombat}
        onDeployAll={addMultipleCombatants}
      />

      <EncounterModal
        isOpen={isEncounterModalOpen}
        onClose={() => setIsEncounterModalOpen(false)}
        currentCombatants={combatants} // Para poder guardar
        onLoadEncounter={loadEncounter} // Para poder cargar
      />

      <StatBlockModal
        isOpen={!!viewingMonsterIndex}
        onClose={() => {
          setViewingMonsterIndex(null);
          setViewingMonsterData(null);
        }}
        monsterIndex={viewingMonsterIndex}
        localData={viewingMonsterData} // <-- EL MODAL RECIBE LOS DATOS
      />
    </Layout>
  );
}

export default App;
