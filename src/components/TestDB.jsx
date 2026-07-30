import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import pb from '../lib/pb';

const TestDB = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [testWriteStatus, setTestWriteStatus] = useState('No iniciado');

  const addLog = (message, type = 'info') => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      setLoading(true);
      setLogs([]);
      addLog('=== Iniciando diagnóstico de PocketBase ===');
      addLog('API: https://api-dm.javistudio.dev');

      if (!user) {
        addLog('No hay ningún usuario autenticado en la sesión.', 'warning');
        setLoading(false);
        return;
      }

      addLog(`Usuario autenticado: Email = ${user.email}, UID = ${user.id}, Anónimo = ${user.isAnonymous}`);

      try {
        addLog("Intentando leer TODA la colección 'custom_monsters' sin filtros...");
        const all = await pb.collection('custom_monsters').getFullList();
        addLog(`Éxito. Se encontraron ${all.length} monstruos en total.`);
        all.forEach((m) => addLog(`Monstruo: ID = ${m.id}, Nombre = ${m.name}, user_id = ${m.user_id}`));
      } catch (err) {
        addLog(`Error al leer colección sin filtros: ${err.message}`, 'error');
      }

      try {
        addLog(`Intentando leer 'custom_monsters' filtrando por user_id == '${user.id}'...`);
        const mine = await pb.collection('custom_monsters').getFullList({
          filter: `user_id = "${user.id}"`,
        });
        addLog(`Éxito. Se encontraron ${mine.length} monstruos asociados a tu UID.`);
        mine.forEach((m) => addLog(`Tu Monstruo: Nombre = ${m.name}, HP = ${m.hp}, AC = ${m.ac}`));
      } catch (err) {
        addLog(`Error al filtrar monstruos por user_id: ${err.message}`, 'error');
      }

      try {
        addLog(`Intentando leer 'party_members' para dm_id == '${user.id}'...`);
        const party = await pb.collection('party_members').getFullList({
          filter: `dm_id = "${user.id}"`,
        });
        addLog(`Éxito. Se encontraron ${party.length} miembros de grupo asociados a tu UID.`);
      } catch (err) {
        addLog(`Error al leer party_members: ${err.message}`, 'error');
      }

      try {
        addLog(`Intentando leer 'user_prefs' y 'saved_encounters'...`);
        const prefs = await pb.collection('user_prefs').getFullList({
          filter: `dm_id = "${user.id}"`,
        });
        const enc = await pb.collection('saved_encounters').getFullList({
          filter: `dm_id = "${user.id}"`,
        });
        addLog(`Preferencias: ${prefs.length} · Encuentros guardados: ${enc.length}`);
      } catch (err) {
        addLog(`Error al leer prefs/encuentros: ${err.message}`, 'error');
      }

      setLoading(false);
    };

    runDiagnostics();
  }, [user]);

  const handleTestWrite = async () => {
    if (!user || user.isAnonymous) {
      setTestWriteStatus('Necesitas una cuenta real');
      return;
    }
    setTestWriteStatus('Escribiendo...');
    try {
      const created = await pb.collection('custom_monsters').create({
        user_id: user.id,
        name: 'TEST_MONSTER_DELETE_ME',
        type: 'test',
        hp: 1,
        ac: 10,
        dexterity: 10,
        cr: '0',
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        special_abilities: [],
        actions: [],
      });
      await pb.collection('custom_monsters').delete(created.id);
      setTestWriteStatus('✅ Escritura y borrado OK');
      addLog('Test de escritura: OK (create + delete)', 'success');
    } catch (err) {
      setTestWriteStatus(`❌ Error: ${err.message}`);
      addLog(`Test de escritura falló: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 font-mono text-sm">
      <h1 className="text-2xl font-bold text-yellow-500 mb-4">Diagnóstico PocketBase</h1>
      {loading && <p className="text-gray-400 animate-pulse">Ejecutando pruebas...</p>}
      <div className="space-y-2 mb-6 max-h-[60vh] overflow-y-auto">
        {logs.map((l, i) => (
          <div key={i} className={`${l.type === 'error' ? 'text-red-400' : l.type === 'warning' ? 'text-amber-400' : l.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
            <span className="text-gray-600">[{l.time}]</span> {l.message}
          </div>
        ))}
      </div>
      <button onClick={handleTestWrite} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded">
        Probar escritura
      </button>
      <p className="mt-2 text-xs text-gray-500">{testWriteStatus}</p>
    </div>
  );
};

export default TestDB;
