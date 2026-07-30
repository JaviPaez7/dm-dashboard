// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
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
import Dice3DCanvas from "./components/Dice3DCanvas";
import { useAuth } from "./context/AuthContext";
import pb from "./lib/pb";
import { getUserPrefs, patchUserPrefs } from "./lib/userPrefs";
import ThemeParticles from "./components/ThemeParticles";

function App() {
  const { user, recoveryMode } = useAuth();
  const [combatants, setCombatants] = useState([]);
  const [party, setParty] = useState([]);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [roundCount, setRoundCount] = useState(1);
  const [toast, setToast] = useState(null);
  const [combatLogs, setCombatLogs] = useState([]);
  const [active3DRoll, setActive3DRoll] = useState(null);
  const [activeTheme, setActiveTheme] = useState("fortaleza");
  const [prefsReady, setPrefsReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const liveEncounterId = useRef(null);
  const [shareLink, setShareLink] = useState("");
  const [activeTab, setActiveTab] = useState("monsters");
  const [activeRightTab, setActiveRightTab] = useState("dice");
  const [mobileView, setMobileView] = useState("combat");
  const [viewingMonsterIndex, setViewingMonsterIndex] = useState(null);
  const [viewingMonsterData, setViewingMonsterData] = useState(null);
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);

  useEffect(() => {
    const themes = ["theme-fortaleza", "theme-bosque", "theme-infierno", "theme-tundra", "theme-piratas"];
    document.body.classList.remove(...themes);
    document.body.classList.add(`theme-${activeTheme}`);
    if (!document.body.classList.contains("theme-transition")) {
      document.body.classList.add("theme-transition");
    }
  }, [activeTheme]);

  useEffect(() => {
    if (!prefsReady || !user || user.isAnonymous) return;
    patchUserPrefs(user.id, { theme: activeTheme });
  }, [activeTheme, prefsReady, user]);

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

  // Cargar preferencias + party + combate desde PocketBase
  useEffect(() => {
    if (!user) return;

    if (user.isAnonymous) {
      setCombatants([]);
      setParty([]);
      setCurrentTurnIndex(0);
      setRoundCount(1);
      setCombatLogs([]);
      setActiveTheme("fortaleza");
      setShareLink("");
      liveEncounterId.current = null;
      setPrefsReady(true);
      setDataReady(true);
      return;
    }

    let cancelled = false;
    setPrefsReady(false);
    setDataReady(false);
    setShareLink(`${window.location.origin}/player/${user.id}`);

    const loadAccountData = async () => {
      try {
        const prefs = await getUserPrefs(user.id);
        if (!cancelled) {
          setActiveTheme(prefs.theme || "fortaleza");
          setPrefsReady(true);
        }

        const partyRows = await pb.collection("party_members").getFullList({
          filter: `dm_id = "${user.id}"`,
        });
        if (!cancelled) {
          setParty(
            partyRows.map((p) => ({
              id: p.id,
              name: p.name,
              hp: p.hp,
              maxHp: p.max_hp,
              ac: p.ac,
              initiative: p.initiative,
              isPlayer: p.is_player,
            })),
          );
        }

        const liveRows = await pb.collection("encounters_live").getFullList({
          filter: `dm_id = "${user.id}"`,
        });
        if (!cancelled) {
          if (liveRows.length > 0) {
            liveEncounterId.current = liveRows[0].id;
            const state = liveRows[0].state_data || {};
            setCombatants(Array.isArray(state.combatants) ? state.combatants : []);
            setCurrentTurnIndex(state.currentTurnIndex || 0);
            setRoundCount(state.roundCount || 1);
            if (state.activeTheme) setActiveTheme(state.activeTheme);
            setCombatLogs(Array.isArray(state.combatLogs) ? state.combatLogs : []);
          } else {
            liveEncounterId.current = null;
            setCombatants([]);
            setCurrentTurnIndex(0);
            setRoundCount(1);
            setCombatLogs([]);
          }
          setDataReady(true);
        }
      } catch (error) {
        console.error("Error al cargar datos de cuenta:", error);
        if (!cancelled) {
          setPrefsReady(true);
          setDataReady(true);
        }
      }
    };

    loadAccountData();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Sincronizar combate en tiempo real (vista jugador + persistencia de cuenta)
  useEffect(() => {
    if (!user || user.isAnonymous || !dataReady) return;

    const syncToPocketBase = async () => {
      const state = {
        combatants: combatants.map((c) => ({
          id: c.id,
          name: c.name,
          hp: c.hp,
          maxHp: c.maxHp,
          initiative: c.initiative,
          isPlayer: c.isPlayer,
          conditions: c.conditions || [],
          deathSaves: c.deathSaves || { success: 0, failure: 0 },
          ac: c.ac,
          apiIndex: c.apiIndex,
          isLocal: c.isLocal,
          localData: c.localData || null,
        })),
        currentTurnIndex,
        roundCount,
        activeTheme,
        combatLogs,
      };

      try {
        if (liveEncounterId.current) {
          await pb.collection("encounters_live").update(liveEncounterId.current, {
            state_data: state,
          });
        } else {
          const created = await pb.collection("encounters_live").create({
            dm_id: user.id,
            state_data: state,
          });
          liveEncounterId.current = created.id;
        }
      } catch (error) {
        console.error("Error al sincronizar combate:", error);
      }
    };

    const timeout = setTimeout(syncToPocketBase, 1000);
    return () => clearTimeout(timeout);
  }, [combatants, currentTurnIndex, roundCount, user, activeTheme, combatLogs, dataReady]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("¡Enlace de Vista de Jugador copiado al portapapeles!");
  };

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
      const c = prev.find((x) => x.id === id);
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
      const c = prev.find((x) => x.id === id);
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
      const c = prev.find((x) => x.id === id);
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

    if (window.innerWidth < 1024) {
      showToast(data.name || "Criatura", finalHp);
    }
  };

  const savePartyMember = async (newMember) => {
    setParty((prev) => {
      const exists = prev.find((p) => p.id === newMember.id);
      if (exists) {
        return prev.map((p) => (p.id === newMember.id ? newMember : p));
      }
      return [...prev, newMember];
    });

    if (user && !user.isAnonymous) {
      try {
        const isNew = typeof newMember.id !== "string" || newMember.id.length < 10;
        const payload = {
          dm_id: user.id,
          name: newMember.name,
          hp: newMember.hp,
          max_hp: newMember.maxHp,
          ac: newMember.ac,
          initiative: newMember.initiative,
          is_player: newMember.isPlayer,
        };

        if (isNew) {
          await pb.collection("party_members").create(payload);
        } else {
          await pb.collection("party_members").update(newMember.id, payload);
        }

        const rows = await pb.collection("party_members").getFullList({
          filter: `dm_id = "${user.id}"`,
        });
        setParty(
          rows.map((p) => ({
            id: p.id,
            name: p.name,
            hp: p.hp,
            maxHp: p.max_hp,
            ac: p.ac,
            initiative: p.initiative,
            isPlayer: p.is_player,
          })),
        );
      } catch (error) {
        console.error("Error al guardar miembro de la party:", error);
      }
    }
  };

  const deletePartyMember = async (id) => {
    setParty(party.filter((p) => p.id !== id));
    if (user && !user.isAnonymous && typeof id === "string" && id.length >= 10) {
      try {
        await pb.collection("party_members").delete(id);
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
      <ThemeParticles activeTheme={activeTheme} />
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 lg:hidden pointer-events-none bg-gray-900 border border-green-600 text-green-300 text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <span>⚔️</span>
          <span>{toast.name} añadido ({toast.hp} HP)</span>
        </div>
      )}

      <Layout
        mobileView={mobileView}
        setMobileView={setMobileView}
        activeTheme={activeTheme}
        onChangeTheme={setActiveTheme}
      >
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
            {activeRightTab === "dice" && (
              <DiceRoller
                onTrigger3DRoll={(result, callback) => {
                  setActive3DRoll({ result, callback });
                }}
              />
            )}
            {activeRightTab === "sound" && <Soundboard />}
            {activeRightTab === "notes" && <Notepad />}
          </div>
        </div>

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
        {active3DRoll && (
          <Dice3DCanvas
            result={active3DRoll.result}
            onComplete={() => {
              if (active3DRoll.callback) active3DRoll.callback();
              setActive3DRoll(null);
            }}
          />
        )}
      </Layout>
    </>
  );
}

export default App;
