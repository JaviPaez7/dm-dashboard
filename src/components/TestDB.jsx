import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

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
      addLog("=== Iniciando diagnóstico de base de datos ===");

      // 1. Verificar variables de entorno de Firebase
      try {
        const config = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? `${import.meta.env.VITE_FIREBASE_API_KEY.slice(0, 6)}...${import.meta.env.VITE_FIREBASE_API_KEY.slice(-4)}` : "FALTA (vacío)",
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "FALTA (vacío)",
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "FALTA (vacío)",
          appId: import.meta.env.VITE_FIREBASE_APP_ID || "FALTA (vacío)"
        };
        addLog(`Configuración de Firebase detectada: Proyecto ID = ${config.projectId}, Auth Domain = ${config.authDomain}`);
        addLog(`API Key: ${config.apiKey}`);
      } catch (err) {
        addLog(`Error al leer variables de entorno: ${err.message}`, 'error');
      }

      // 2. Verificar usuario
      if (!user) {
        addLog("No hay ningún usuario autenticado en la sesión.", "warning");
        setLoading(false);
        return;
      }

      addLog(`Usuario autenticado detectado: Email = ${user.email}, UID = ${user.id}, Anónimo = ${user.isAnonymous}`);

      // 3. Probar lectura de Monstruos Personalizados sin filtro
      try {
        addLog("Intentando leer TODA la colección 'custom_monsters' sin filtros...");
        const allMonstersSnap = await getDocs(collection(db, 'custom_monsters'));
        addLog(`Éxito total. Se encontraron ${allMonstersSnap.size} monstruos en total en la colección 'custom_monsters'.`);
        
        allMonstersSnap.forEach(doc => {
          const data = doc.data();
          addLog(`Monstruo: ID = ${doc.id}, Nombre = ${data.name}, user_id = ${data.user_id}`);
        });
      } catch (err) {
        addLog(`Error al leer colección sin filtros: ${err.message}`, 'error');
      }

      // 4. Probar lectura de Monstruos Personalizados con filtro del usuario actual
      try {
        addLog(`Intentando leer 'custom_monsters' filtrando por user_id == '${user.id}'...`);
        const q = query(collection(db, 'custom_monsters'), where('user_id', '==', user.id));
        const userMonstersSnap = await getDocs(q);
        addLog(`Éxito. Se encontraron ${userMonstersSnap.size} monstruos asociados a tu UID.`);
        
        userMonstersSnap.forEach(doc => {
          const data = doc.data();
          addLog(`Tu Monstruo: Nombre = ${data.name}, HP = ${data.hp}, AC = ${data.ac}`);
        });
      } catch (err) {
        addLog(`Error al filtrar monstruos por user_id: ${err.message}`, 'error');
      }

      // 5. Probar lectura del grupo (party_members)
      try {
        addLog(`Intentando leer 'party_members' para dm_id == '${user.id}'...`);
        const q = query(collection(db, 'party_members'), where('dm_id', '==', user.id));
        const partySnap = await getDocs(q);
        addLog(`Éxito. Se encontraron ${partySnap.size} miembros de grupo asociados a tu UID.`);
      } catch (err) {
        addLog(`Error al leer party_members: ${err.message}`, 'error');
      }

      setLoading(false);
    };

    runDiagnostics();
  }, [user]);

  const handleTestWrite = async () => {
    if (!user) return;
    setTestWriteStatus('Escribiendo...');
    try {
      const testRef = doc(db, 'test_connection', user.id);
      await setDoc(testRef, {
        updated_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email
      });
      setTestWriteStatus('¡Escritura exitosa! Reglas de escritura funcionando.');
      addLog("Escritura de prueba en 'test_connection' completada con éxito.", "info");
    } catch (err) {
      setTestWriteStatus(`Error de escritura: ${err.message}`);
      addLog(`Error de escritura: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-[#121212] border border-gray-800 rounded-xl p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-yellow-500 mb-4 border-b border-gray-800 pb-2">
          🔍 Diagnóstico de Base de Datos Firebase
        </h1>

        <div className="mb-6 flex gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-bold transition-all"
          >
            ← Volver al Panel Principal
          </button>
          <button 
            onClick={handleTestWrite}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-sm font-bold transition-all"
          >
            Probar Escritura Directa
          </button>
        </div>

        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase font-black">Estado de Escritura de Prueba:</span>
          <div className="mt-1 p-2 bg-black/40 rounded border border-gray-800 text-sm font-mono">
            {testWriteStatus}
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-500 uppercase font-black">Logs del Diagnóstico:</span>
          <div className="mt-2 bg-[#050505] border border-gray-800 rounded-lg p-4 h-[400px] overflow-y-auto font-mono text-xs space-y-2">
            {logs.map((log, i) => (
              <div key={i} className={`p-1.5 rounded ${
                log.type === 'error' ? 'bg-red-950/20 text-red-400 border-l-2 border-red-600' :
                log.type === 'warning' ? 'bg-yellow-950/20 text-yellow-400 border-l-2 border-yellow-600' :
                'text-gray-300'
              }`}>
                <span className="text-gray-600 mr-2">[{log.time}]</span>
                {log.message}
              </div>
            ))}
            {loading && (
              <div className="text-yellow-500 animate-pulse">⏳ Ejecutando pruebas...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDB;
