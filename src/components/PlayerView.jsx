import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PlayerView = ({ dmId }) => {
  const [encounterState, setEncounterState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialState = async () => {
      const { data, error } = await supabase
        .from('encounters_live')
        .select('state_data')
        .eq('dm_id', dmId)
        .single();

      if (error) {
        setError("No hay ningún combate activo en este momento.");
      } else if (data) {
        setEncounterState(data.state_data);
      }
      setLoading(false);
    };

    fetchInitialState();

    // Suscripción en tiempo real
    const channel = supabase
      .channel(`player-view-${dmId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchamos cualquier cambio (INSERT, UPDATE)
          schema: 'public',
          table: 'encounters_live',
          filter: `dm_id=eq.${dmId}`,
        },
        (payload) => {
          console.log("Cambio detectado en Supabase:", payload);
          if (payload.new && payload.new.state_data) {
            setEncounterState(payload.new.state_data);
          }
        }
      )
      .subscribe((status) => {
        console.log("Estado de la suscripción Realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dmId]);

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

  const { combatants = [], currentTurnIndex = 0, roundCount = 1 } = encounterState;

  const getHealthStatus = (c) => {
    if (c.hp <= 0) return { label: 'CAÍDO', color: 'text-red-600' };
    const ratio = c.hp / c.maxHp;
    if (ratio > 0.75) return { label: 'SANO', color: 'text-green-400' };
    if (ratio > 0.4) return { label: 'HERIDO', color: 'text-yellow-500' };
    if (ratio > 0.1) return { label: 'MUY HERIDO', color: 'text-orange-600' };
    return { label: 'CRÍTICO', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl z-10">
        <header className="flex justify-between items-end border-b border-red-800/50 pb-6 mb-8">
          <div>
            <h1 className="text-5xl font-black text-red-600 tracking-widest uppercase mb-1" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              ⚔️ Crónicas de Batalla
            </h1>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Información oficial para los aventureros</p>
          </div>
          <div className="text-right bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-xl">
            <span className="text-5xl font-black text-white leading-none">{roundCount}</span>
            <span className="block text-[10px] text-yellow-600 font-bold uppercase mt-1">Ronda Actual</span>
          </div>
        </header>

        <div className="space-y-4">
          {combatants.map((c, idx) => {
            const isActive = idx === currentTurnIndex;
            const health = getHealthStatus(c);
            
            return (
              <div 
                key={c.id} 
                className={`group flex items-center gap-4 transition-all duration-700 ${isActive ? 'scale-105 z-20' : 'opacity-40 scale-95 blur-[0.5px] hover:blur-0'}`}
              >
                {/* Iniciativa Hexágono o Círculo */}
                <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center font-black text-2xl rounded-full border-4 shadow-2xl transition-all ${isActive ? 'bg-red-700 border-yellow-500 text-white animate-pulse' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                  {c.initiative}
                </div>

                {/* Ficha Combatiente */}
                <div className={`flex-grow h-20 flex items-center px-8 rounded-2xl transition-all border-l-[6px] shadow-lg ${isActive ? 'bg-gray-800 border-red-500 ring-2 ring-red-900/30' : 'bg-gray-900/40 border-gray-800'}`}>
                  <div className="flex-grow">
                    <h3 className={`text-2xl font-bold uppercase tracking-wide ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {c.name}
                    </h3>
                    <div className="flex gap-2.5 mt-1">
                       {c.conditions?.map((cond, i) => (
                         <span key={i} className="text-lg drop-shadow-md">{cond}</span>
                       ))}
                    </div>
                  </div>

                  <div className="text-right px-4 py-2 rounded-lg bg-black/20 border border-white/5">
                    <span className={`text-xs font-black tracking-[0.2em] ${health.color} uppercase drop-shadow-sm`}>
                      {health.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Fondo decorativo más sutil y menos oscuro */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(30,0,0,0.2)_0%,rgba(0,0,0,0.4)_100%)] z-0"></div>
    </div>
  );
};

export default PlayerView;
