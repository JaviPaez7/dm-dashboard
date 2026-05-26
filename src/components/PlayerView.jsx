import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import ThemeParticles from './ThemeParticles';

const PlayerView = ({ dmId }) => {
  const [encounterState, setEncounterState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, 'encounters_live', dmId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.state_data) {
          setEncounterState(data.state_data);
          setError(null);
        } else {
          setError("No hay ningún combate activo en este momento.");
        }
      } else {
        setError("No hay ningún combate activo en este momento.");
      }
      setLoading(false);
    }, (err) => {
      console.error("Error de conexión en tiempo real:", err);
      setError("Error al conectar con la crónica de batalla.");
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [dmId]);

  // Extraemos la información del combate actual, incluyendo el tema activo
  const { 
    combatants = [], 
    currentTurnIndex = 0, 
    roundCount = 1,
    activeTheme = "fortaleza" 
  } = encounterState || {};

  // Efecto para sincronizar el tema ambiental en el body del jugador
  useEffect(() => {
    if (!activeTheme) return;
    const themes = ["theme-fortaleza", "theme-bosque", "theme-infierno", "theme-tundra", "theme-piratas"];
    document.body.classList.remove(...themes);
    document.body.classList.add(`theme-${activeTheme}`);
    if (!document.body.classList.contains("theme-transition")) {
      document.body.classList.add("theme-transition");
    }
  }, [activeTheme]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-bold text-xl animate-pulse">
      CONECTANDO CON EL MASTER...
    </div>
  );

  if (error || !encounterState) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-black text-gray-500 mb-4 tracking-tighter uppercase" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
        ⌛ Fuera de Combate
      </h1>
      <p className="text-gray-400 max-w-md italic">
        El Dungeon Master aún no ha iniciado la sesión o el combate ha terminado. Espera a que la batalla comience...
      </p>
    </div>
  );

  const getHealthStatus = (c) => {
    if (c.hp <= 0) return { label: 'CAÍDO', color: 'text-red-600' };
    const ratio = c.hp / c.maxHp;
    if (ratio > 0.75) return { label: 'SANO', color: 'text-green-400' };
    if (ratio > 0.4) return { label: 'HERIDO', color: 'text-yellow-500' };
    if (ratio > 0.1) return { label: 'MUY HERIDO', color: 'text-orange-600' };
    return { label: 'CRÍTICO', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-dungeon-dark text-white p-4 md:p-8 relative overflow-x-hidden transition-colors duration-500">
      {/* Fondo de ambiente y partículas sincronizadas con el DM */}
      <ThemeParticles activeTheme={activeTheme} />
      
      <div className="max-w-4xl mx-auto relative z-10 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-dungeon-gold/30 pb-8 mb-10 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-dungeon-gold via-dungeon-accent to-dungeon-gold tracking-tighter uppercase mb-2 leading-none" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              Crónicas de Batalla
            </h1>
            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] opacity-80">Información del Reino para los Aventureros</p>
          </div>
          <div className="flex flex-col items-center bg-dungeon-panel px-6 py-3 rounded-2xl border border-dungeon-gold/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <span className="text-4xl md:text-5xl font-black text-dungeon-gold leading-none tracking-tighter">{roundCount}</span>
            <span className="block text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Ronda Actual</span>
          </div>
        </header>

        <div className="space-y-6">
          {combatants.map((c, idx) => {
            const isActive = idx === currentTurnIndex;
            const health = getHealthStatus(c);
            
            return (
              <div 
                key={c.id} 
                className={`group flex items-center gap-3 md:gap-6 transition-all duration-500 ${isActive ? 'translate-x-2' : 'opacity-30 grayscale-[0.5] blur-[1px] hover:blur-0 hover:opacity-60'}`}
              >
                {/* Iniciativa */}
                <div className={`w-12 h-12 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center font-black text-xl md:text-2xl rounded-full border-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isActive ? 'bg-dungeon-red border-dungeon-gold text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-dungeon-panel border-dungeon-border text-gray-500'}`}>
                  {c.initiative}
                </div>

                {/* Tarjeta del Combatiente */}
                <div className={`flex-grow min-h-[70px] md:min-h-[85px] flex items-center px-4 md:px-10 rounded-xl md:rounded-2xl transition-all border-l-4 shadow-2xl relative overflow-hidden ${isActive ? 'bg-dungeon-panel border-dungeon-red ring-1 ring-dungeon-red/20 shadow-dungeon-red/20' : 'bg-dungeon-panel/40 border-dungeon-border'}`}>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-dungeon-red/10 to-transparent pointer-events-none animate-pulse"></div>
                  )}
                  
                  <div className="flex-grow py-4 relative z-10">
                    <h3 className={`text-lg md:text-3xl font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {c.name}
                    </h3>
                    <div className="flex gap-2.5 mt-1.5 flex-wrap">
                       {c.conditions?.map((cond, i) => (
                          <span key={i} className="text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter grayscale-[0.3]">
                            {cond}
                          </span>
                       ))}
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 transition-all ${isActive ? 'scale-110 border-dungeon-gold/20 shadow-[0_0_10px_rgba(0,0,0,0.5)]' : 'opacity-60'}`}>
                    <span className={`text-[9px] md:text-[11px] font-black tracking-[0.2em] ${health.color} uppercase drop-shadow-sm`}>
                      {health.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlayerView;
