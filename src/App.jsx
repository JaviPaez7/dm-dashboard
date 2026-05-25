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
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import { useAuth } from "./context/AuthContext";
import { db } from "./lib/firebase";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc } from "firebase/firestore";

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
  const [combatLogs, setCombatLogs] = useState([]);

  const addCombatLog = (message) => {
    const newLog = {
      id: Date.now() + Math.random(),
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };
    setCombatLogs((prev) => [...prev, newLog].slice(-50));
  };

  const clearCombatLogs = () => {
    setCombatLogs([]);
  };

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

  const { user, recoveryMode, setRecoveryMode } = useAuth();
  const [shareLink, setShareLink] = useState("");

  // --- PERSISTENCIA (Sin cambios) ---
  useEffect(() => {
    localStorage.setItem("dm_dashboard_combatants", JSON.stringify(combatants));
  }, [combatants]);
  useEffect(() => {
    localStorage.setItem("dm_dashboard_party", JSON.stringify(party));
  }, [party]);

  // --- NUEVO: SINCRONIZACIÓN EN TIEMPO REAL CON FIREBASE (VISTA JUGADOR) ---
  useEffect(() => {
    if (!user || user.isAnonymous) return;

    const syncToFirebase = async () => {
      const state = {
        combatants: combatants.map(c => ({
          id: c.id,
          name: c.name,
          hp: c.hp,
          maxHp: c.maxHp,
          initiative: c.initiative,
          isPlayer: c.isPlayer,
          conditions: c.conditions || [],
          deathSaves: c.deathSaves || { success: 0, failure: 0 }
        })),
        currentTurnIndex,
        roundCount
      };

      try {
        await setDoc(doc(db, 'encounters_live', user.id), { 
          dm_id: user.id, 
          state_data: state,
          updated_at: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error al sincronizar combate:", error);
      }
    };

    // Debounce ligero para no saturar la red en cada pequeño cambio
    const timeout = setTimeout(syncToFirebase, 1000);
    return () => clearTimeout(timeout);
  }, [combatants, currentTurnIndex, roundCount, user]);

  useEffect(() => {
    if (user) {
      if (user.isAnonymous) {
        setShareLink("");
        return;
      }

      setShareLink(`${window.location.origin}/player/${user.id}`);
      
      // Cargar Party desde Firebase
      const fetchParty = async () => {
        try {
          const q = query(collection(db, 'party_members'), where('dm_id', '==', user.id));
          const querySnapshot = await getDocs(q);
          const mappedData = querySnapshot.docs.map(doc => {
            const p = doc.data();
            return {
              id: doc.id,
              name: p.name,
              hp: p.hp,
              maxHp: p.max_hp,
              ac: p.ac,
              initiative: p.initiative,
              isPlayer: p.is_player
            };
          });
          
          if (mappedData.length > 0) {
            setParty(mappedData);
          } else if (party && party.length > 0) {
            // Si la base de datos está vacía pero localmente tenemos un grupo, lo subimos
            console.log("Subiendo grupo local a Firestore...");
            for (const member of party) {
              const memberRef = doc(collection(db, 'party_members'));
              await setDoc(memberRef, {
                dm_id: user.id,
                name: member.name,
                hp: member.hp,
                max_hp: member.maxHp,
                ac: member.ac,
                initiative: member.initiative,
                is_player: member.isPlayer
              });
            }
            // Recargar para sincronizar IDs de Firestore
            const updatedSnapshot = await getDocs(q);
            setParty(updatedSnapshot.docs.map(doc => {
              const p = doc.data();
              return {
                id: doc.id,
                name: p.name,
                hp: p.hp,
                maxHp: p.max_hp,
                ac: p.ac,
                initiative: p.initiative,
                isPlayer: p.is_player
              };
            }));
          } else {
            setParty([]);
          }
        } catch (error) {
          console.error("Error al cargar la party:", error);
        }
      };

      fetchParty();
    }
  }, [user]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("¡Enlace de Vista de Jugador copiado al portapapeles!");
  };

  // --- TODAS TUS FUNCIONES DE COMBATE (Sin cambios) ---
  const addCombatant = (newCombatant) => {
    addCombatLog(`⚔️ ${newCombatant.name} se une al combate (Iniciativa: ${newCombatant.initiative}).`);
    setCombatants((prev) =>
      [...prev, { ...newCombatant, id: Date.now() }].sort(
        (a, b) => b.initiative - a.initiative,
      ),
    );
  };
  const updateInitiative = (id, newInitiative) => {
    setCombatants((prev) => {
      const c = prev.find(x => x.id === id);
      if (c) addCombatLog(`🎲 Iniciativa de ${c.name} cambiada a ${newInitiative}.`);
      const updated = prev.map((c) =>
        c.id === id ? { ...c, initiative: newInitiative } : c,
      );
      return updated.sort((a, b) => b.initiative - a.initiative);
    });
  };
  const clearMonsters = () => {
    addCombatLog("🧹 Limpiando monstruos de la mesa. Se mantienen los PJs.");
    setCombatants((prev) => prev.filter((c) => c.isPlayer === true));
    setCurrentTurnIndex(0);
    setRoundCount(1);
  };
  const removeCombatant = (id) => {
    setCombatants((prev) => {
      const c = prev.find(x => x.id === id);
      if (c) addCombatLog(`✕ ${c.name} retirado del combate.`);
      return prev.filter((c) => c.id !== id);
    });
  };
  const updateHP = (id, amount) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newHp = Math.max(0, c.hp + amount);
          const diff = newHp - c.hp;
          if (diff < 0) {
            addCombatLog(`💔 ${c.name} recibe ${Math.abs(diff)} de daño (HP: ${newHp}/${c.maxHp}).`);
            if (newHp === 0 && c.hp > 0) {
              addCombatLog(`💤 ${c.name} ha caído inconsciente.`);
            }
          } else if (diff > 0) {
            addCombatLog(`💚 ${c.name} recupera ${diff} HP (HP: ${newHp}/${c.maxHp}).`);
          }
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
    addCombatLog("💤 El grupo realiza un Descanso Largo. Toda la vida restaurada.");
    setParty((prevParty) => prevParty.map((p) => ({ ...p, hp: p.maxHp })));
    setCombatants((prev) =>
      prev.map((c) => (c.isPlayer ? { ...c, hp: c.maxHp } : c)),
    );
  };
  const updateCombatantStats = (id, field, value) =>
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: parseInt(value) } : c)),
    );
  const healCombatant = (id) => {
    setCombatants((prev) => {
      const c = prev.find(x => x.id === id);
      if (c) addCombatLog(`⛑️ ${c.name} curado al máximo (${c.maxHp} HP).`);
      return prev.map((c) => (c.id === id ? { ...c, hp: c.maxHp } : c));
    });
  };
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
    let nextIndex = 0;
    let nextRound = roundCount;
    if (currentTurnIndex >= combatants.length - 1) {
      nextIndex = 0;
      nextRound = roundCount + 1;
      setRoundCount(nextRound);
      setCurrentTurnIndex(0);
      addCombatLog(`⏳ --- Nueva Ronda: Ronda ${nextRound} ---`);
    } else {
      nextIndex = currentTurnIndex + 1;
      setCurrentTurnIndex(nextIndex);
    }
    const nextCombatant = combatants[nextIndex];
    if (nextCombatant) {
      addCombatLog(`⚔️ Turno de ${nextCombatant.name}.`);
    }
  };
  const resetEncounter = () => {
    addCombatLog("🧹 Mesa limpiada. Combate reseteado.");
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
    const dex = data.dexterity || data.stats?.dex;
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
  const savePartyMember = async (newMember) => {
    // Optimistic Update
    setParty((prev) => {
      const exists = prev.find((p) => p.id === newMember.id);
      if (exists) {
        return prev.map((p) => (p.id === newMember.id ? newMember : p));
      } else {
        return [...prev, newMember];
      }
    });

    // Firebase Sync
    if (user && !user.isAnonymous) {
      try {
        const isNew = typeof newMember.id !== 'string' || newMember.id.length < 10;
        const memberRef = isNew 
          ? doc(collection(db, 'party_members')) 
          : doc(db, 'party_members', newMember.id);

        await setDoc(memberRef, {
          dm_id: user.id,
          name: newMember.name,
          hp: newMember.hp,
          max_hp: newMember.maxHp,
          ac: newMember.ac,
          initiative: newMember.initiative,
          is_player: newMember.isPlayer
        });
        
        // Refetch para asegurar IDs y consistencia
        const q = query(collection(db, 'party_members'), where('dm_id', '==', user.id));
        const querySnapshot = await getDocs(q);
        setParty(querySnapshot.docs.map(doc => {
          const p = doc.data();
          return {
            id: doc.id,
            name: p.name,
            hp: p.hp,
            maxHp: p.max_hp,
            ac: p.ac,
            initiative: p.initiative,
            isPlayer: p.is_player
          };
        }));
      } catch (error) {
        console.error("Error al guardar miembro de la party:", error);
      }
    }
  };

  const deletePartyMember = async (id) => {
    setParty(party.filter((p) => p.id !== id));
    if (user && !user.isAnonymous && typeof id === 'string' && id.length >= 10) {
      try {
        await deleteDoc(doc(db, 'party_members', id));
      } catch (error) {
        console.error("Error al eliminar miembro de la party:", error);
      }
    }
  };
  const addPartyMemberToCombat = (member) => {
    addCombatLog(`🛡️ PJ ${member.name} se une al combate (Iniciativa: ${member.initiative}).`);
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
  const addMultipleCombatants = (squad) => {
    squad.forEach((m) => {
      addCombatLog(`🛡️ PJ ${m.name} se une al combate (Iniciativa: ${m.initiative}).`);
    });
    setCombatants((prev) =>
      [...prev, ...squad].sort((a, b) => b.initiative - a.initiative),
    );
  };
  const handleViewStatBlock = (index, data = null) => {
    setViewingMonsterIndex(index);
    setViewingMonsterData(data);
  };
  const loadEncounter = (savedMonsters) => {
    addCombatLog(`📜 Encuentro cargado con ${savedMonsters.length} criaturas.`);
    const newCombatants = savedMonsters.map((m) => {
      addCombatLog(`⚔️ ${m.name} se une al combate (Iniciativa: ${m.initiative}).`);
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


  if (recoveryMode) {
    return <ResetPassword />;
  }

  if (!user) {
    return <Login />;
  }

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
          shareLink={shareLink}
          onCopyLink={copyShareLink}
          combatLogs={combatLogs}
          onClearLogs={clearCombatLogs}
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