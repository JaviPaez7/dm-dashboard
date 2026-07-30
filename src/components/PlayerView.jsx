import React, { useEffect, useState } from 'react';
import pb from '../lib/pb';
import ThemeParticles from './ThemeParticles';

const PlayerView = ({ dmId }) => {
  const [encounterState, setEncounterState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsub = null;
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await pb.collection('encounters_live').getFullList({
          filter: `dm_id = "${dmId}"`,
        });
        if (cancelled) return;
        if (rows.length > 0) {
          setEncounterState(rows[0].state_data || null);
          setError(null);
        } else {
          setEncounterState(null);
          setError('No hay ningún combate activo en este momento.');
        }
      } catch (err) {
        console.error('Error al conectar con PocketBase:', err);
        if (!cancelled) setError('Error al conectar con la crónica de batalla.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const subscribe = async () => {
      try {
        unsub = await pb.collection('encounters_live').subscribe('*', (event) => {
          if (event.record?.dm_id !== dmId) return;
          if (event.action === 'create' || event.action === 'update') {
            setEncounterState(event.record.state_data || null);
            setError(null);
          } else if (event.action === 'delete') {
            setEncounterState(null);
            setError('El combate ha terminado.');
          }
        });
      } catch (err) {
        console.error('Error de conexión en tiempo real:', err);
      }
    };

    load();
    subscribe();

    return () => {
      cancelled = true;
      if (unsub) {
        pb.collection('encounters_live').unsubscribe('*');
      }
    };
  }, [dmId]);

  const {
    combatants = [],
    currentTurnIndex = 0,
    roundCount = 1,
    activeTheme = 'fortaleza',
  } = encounterState || {};

  useEffect(() => {
    if (!activeTheme) return;
    const themes = ['theme-fortaleza', 'theme-bosque', 'theme-infierno', 'theme-tundra', 'theme-piratas'];
    document.body.classList.remove(...themes);
    document.body.classList.add(`theme-${activeTheme}`);
    if (!document.body.classList.contains('theme-transition')) {
      document.body.classList.add('theme-transition');
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
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 relative overflow-hidden">
      <ThemeParticles activeTheme={activeTheme} />
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-red-600 tracking-tighter uppercase" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Orden de Batalla
          </h1>
          <p className="text-yellow-500 font-bold mt-2 tracking-widest uppercase text-sm">
            Ronda {roundCount}
          </p>
        </div>

        <div className="space-y-3">
          {combatants.map((c, idx) => {
            const isActive = idx === currentTurnIndex;
            const status = getHealthStatus(c);
            return (
              <div
                key={c.id || idx}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-red-950/40 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.25)] scale-[1.02]'
                    : 'bg-gray-900/70 border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? 'bg-red-700 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                    {c.initiative}
                  </span>
                  <div className="min-w-0">
                    <div className={`font-bold truncate ${c.isPlayer ? 'text-blue-300' : 'text-gray-100'}`}>
                      {c.name}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {c.isPlayer ? 'PJ' : 'Enemigo'}
                      {c.conditions?.length ? ` · ${c.conditions.join(' ')}` : ''}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-black ${status.color}`}>
                  {status.label}
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
