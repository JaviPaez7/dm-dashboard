// src/App.jsx
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
  // --- ESTADOS BASE (Sin cambios) ---
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
  const [toast, setToast] = useState(null); // { name, hp } | null

  // --- ESTADOS DE PESTAÑAS INTERNAS ---
  const [activeTab, setActiveTab] = useState("monsters");
  const [activeRightTab, setActiveRightTab] = useState("dice");

  // --- NUEVO: ESTADO DE NAVEGACIÓN MÓVIL ---
  // "combat" | "search" | "tools"
  const [mobileView, setMobileView] = useState("combat");

  // --- ESTADO DEL VISOR ---
  const [viewingMonsterIndex, setViewingMonsterIndex] = useState(null);
  const [viewingMonsterData, setViewingMonsterData] = useState(null);
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);

  // --- PERSISTENCIA (Sin cambios) ---
  useEffect(() => {
    localStorage.setItem("dm_dashboard_combatants", JSON.stringify(combatants));
  }, [combatants]);
  useEffect(() => {
    localStorage.setItem("dm_dashboard_party", JSON.stringify(party));
  }, [party]);

  // --- TODAS TUS FUNCIONES DE COMBATE (Sin cambios) ---
  const addCombatant = (newCombatant) => {
    setCombatants((prev) =>
      [...prev, { ...newCombatant, id: Date.now() }].sort(
        (a, b) => b.initiative - a.initiative,
      ),
    );
  };
  const updateInitiative = (id, newInitiative) => {
    setCombatants((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, initiative: newInitiative } : c,
      );
      return updated.sort((a, b) => b.initiative - a.initiative);
    });
  };
  const clearMonsters = () => {
    setCombatants((prev) => prev.filter((c) => c.isPlayer === true));
    setCurrentTurnIndex(0);
    setRoundCount(1);
  };
  const removeCombatant = (id) =>
    setCombatants((prev) => prev.filter((c) => c.id !== id));
  const updateHP = (id, amount) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newHp = Math.max(0, c.hp + amount);
          if (c.isPlayer) {
            setParty((prevParty) =>
              prevParty.map((p) =>
                p.name === c.name ? { ...p, hp: newHp } : p,
              ),
            );
          }
          return { ...c, hp: newHp };
        }
        return c;
      }),
    );
  };
  const handleLongRest = () => {
    setParty((prevParty) => prevParty.map((p) => ({ ...p, hp: p.maxHp })));
    setCombatants((prev) =>
      prev.map((c) => (c.isPlayer ? { ...c, hp: c.maxHp } : c)),
    );
  };
  const updateCombatantStats = (id, field, value) =>
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: parseInt(value) } : c)),
    );
  const healCombatant = (id) =>
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hp: c.maxHp } : c)),
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
    setCombatants([]);
    setRoundCount(1);
    setCurrentTurnIndex(0);
  };
  const showToast = (name, hp) => {
    setToast({ name, hp });
    setTimeout(() => setToast(null), 3000);
  };

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
      isPlayer: false,
    });

    // En móvil: mostrar toast de confirmación
    if (window.innerWidth < 1024) {
      showToast(data.name || "Criatura", finalHp);
    }
  };
  const savePartyMember = (newMember) => {
    setParty((prev) => {
      const exists = prev.find((p) => p.id === newMember.id);
      if (exists) {
        return prev.map((p) => (p.id === newMember.id ? newMember : p));
      } else {
        return [...prev, newMember];
      }
    });
  };
  const deletePartyMember = (id) => setParty(party.filter((p) => p.id !== id));
  const addPartyMemberToCombat = (member) => {
    setCombatants((prev) => {
      const updated = [
        ...prev,
        {
          ...member,
          conditions: member.conditions || [],
          deathSaves: { success: 0, failure: 0 },
        },
      ];
      return updated.sort((a, b) => b.initiative - a.initiative);
    });
  };
  const addMultipleCombatants = (squad) =>
    setCombatants((prev) =>
      [...prev, ...squad].sort((a, b) => b.initiative - a.initiative),
    );
  const handleViewStatBlock = (index, data = null) => {
    setViewingMonsterIndex(index);
    setViewingMonsterData(data);
  };
  const loadEncounter = (savedMonsters) => {
    const newCombatants = savedMonsters.map((m) => {
      return {
        ...m,
        isPlayer: false,
        hp: m.maxHp, 
      };
    });
    setCombatants((prev) =>
      [...prev, ...newCombatants].sort((a, b) => b.initiative - a.initiative),
    );
  };

  return (
    <>
      {/* --- TOAST MÓVIL (monstruo añadido) — FUERA de Layout para no alterar children --- */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 lg:hidden pointer-events-none bg-gray-900 border border-green-600 text-green-300 text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <span>⚔️</span>
          <span>{toast.name} añadido ({toast.hp} HP)</span>
        </div>
      )}

      {/* Pasamos el estado de la vista móvil y el setter al Layout */}
      <Layout mobileView={mobileView} setMobileView={setMobileView}>
        
        {/* --- HIJO 1: COLUMNA IZQUIERDA (COMBATE) --- */}
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
          onHealCombatant={healCombatant}
        />

        {/* --- HIJO 2: COLUMNA CENTRO (PESTAÑAS) --- */}
        <div className="flex flex-col h-full p-2">
          <div className="flex mb-2 bg-gray-800 rounded-lg p-1 border border-gray-700 shrink-0">
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
          <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar p-1">
            {activeTab === "monsters" ? (
              <MonsterSearch
                onAddMonster={addMonsterToCombat}
                onViewStatBlock={handleViewStatBlock} 
              />
            ) : (
              <SpellSearch />
            )}
          </div>
        </div>

        {/* --- HIJO 3: COLUMNA DERECHA (PESTAÑAS MULTIFUNCIÓN) --- */}
        <div className="flex flex-col h-full p-2">
          <div className="flex mb-2 bg-gray-800 rounded-lg p-1 border border-gray-700 shrink-0">
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
          <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar p-1">
            {activeRightTab === "dice" && <DiceRoller />}
            {activeRightTab === "sound" && <Soundboard />}
            {activeRightTab === "notes" && <Notepad />}
          </div>
        </div>

        {/* --- HIJOS RESTANTES: MODALES INVISIBLES --- */}
        <PartyModal
          isOpen={isPartyModalOpen}
          onLongRest={handleLongRest}
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
          currentCombatants={combatants}
          onLoadEncounter={loadEncounter}
        />
        <StatBlockModal
          isOpen={!!viewingMonsterIndex}
          onClose={() => {
            setViewingMonsterIndex(null);
            setViewingMonsterData(null);
          }}
          monsterIndex={viewingMonsterIndex}
          localData={viewingMonsterData}
        />
      </Layout>
    </>
  );
}

export default App;