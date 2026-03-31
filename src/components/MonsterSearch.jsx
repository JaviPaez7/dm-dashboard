import React, { useState, useEffect } from "react";
import { bestiarioES } from "../data/monstruos_es";
import { bestiarioSRD } from "../data/monstruos_srd";
import { adaptarMonstruoSRD } from "../utils/adaptadorMonstruos";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MonsterCreatorModal from "./MonsterCreatorModal";


// Niveles de CR estándar en D&D 5e
const CR_LEVELS = [
  "0",
  "1/8",
  "1/4",
  "1/2",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "30",
];

// --- NUEVO: Diccionario para traducir fracciones a decimales ---
const crToDecimal = {
  "1/8": 0.125,
  "1/4": 0.25,
  "1/2": 0.5,
};

// --- NUEVO: Función para mostrar el CR bonito en la lista ---
const formatCR = (cr) => {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return cr;
};

const HISTORY_KEY = "dm_monster_search_history";
const MAX_HISTORY = 5;

const MonsterSearch = ({ onAddMonster, onViewStatBlock }) => {
  const [query, setQuery] = useState("");
  const [selectedCR, setSelectedCR] = useState("");
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch { return []; }
  });

  const { user } = useAuth();
  const [customMonsters, setCustomMonsters] = useState([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchCustomMonsters = async () => {
      const { data, error } = await supabase.from('custom_monsters').select('*');
      if (!error && data) {
        setCustomMonsters(data);
      }
    };
    fetchCustomMonsters();
  }, [user]);

  const handleCustomMonsterCreated = (newMonster) => {
    setCustomMonsters((prev) => [...prev, newMonster]);
  };

  const handleDeleteCustomMonster = async (id) => {
    if (!confirm("¿Seguro que quieres borrar este monstruo para siempre?")) return;
    
    const { error } = await supabase.from('custom_monsters').delete().eq('id', id);
    if (!error) {
      setCustomMonsters(prev => prev.filter(m => m.id !== id));
      setResults(prev => prev.filter(r => r.index !== id));
    } else {
      alert("Error al borrar: " + error.message);
    }
  };

  const saveToHistory = (term) => {
    if (!term || term.trim().length < 2) return;
    setSearchHistory(prev => {
      const cleaned = [term, ...prev.filter(t => t !== term)].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(cleaned));
      return cleaned;
    });
  };

  const handleQueryChange = (val) => {
    if (query.trim().length >= 2 && val.trim() === "") saveToHistory(query.trim());
    setQuery(val);
  };

  const clearSearch = () => {
    saveToHistory(query.trim());
    setQuery("");
    setSelectedCR("");
  };

  useEffect(() => {
    if (!query.trim() && !selectedCR) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const queryLower = query.toLowerCase();

      const filterLogic = (m) => {
        const nombreES = (m.name || "").toLowerCase();
        const nombreEN = (m.index || "").toLowerCase().replace(/-/g, " ");
        const matchesName = nombreES.includes(queryLower) || nombreEN.includes(queryLower);

        let matchesCR = true;
        if (selectedCR) {
          const decimalTarget = crToDecimal[selectedCR];
          const monsterCR = m.challenge_rating ?? m.cr;
          if (decimalTarget !== undefined) {
            matchesCR = monsterCR === decimalTarget || monsterCR === selectedCR;
          } else {
            matchesCR = monsterCR?.toString() === selectedCR;
          }
        }

        return matchesName && matchesCR;
      };

      const customMatches = customMonsters
        .filter(filterLogic)
        .map((m) => ({ index: m.id, name: m.name, isLocal: true, data: m, isCustom: true }));

      const manualMatches = bestiarioES
        .filter(filterLogic)
        .map((m) => ({ index: m.index, name: m.name, isLocal: true, data: m }));

      const srdMatches = bestiarioSRD
        .filter(filterLogic)
        .filter((m) => !manualMatches.some((manual) => manual.index === m.index))
        .map((m) => {
          const adaptado = adaptarMonstruoSRD(m);
          return { index: adaptado.index, name: adaptado.name, isLocal: false, data: adaptado };
        });

      setResults([...customMatches, ...manualMatches, ...srdMatches].slice(0, 40));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedCR]);

  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      {/* BARRA DE HERRAMIENTAS DE BÚSQUEDA */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          {/* Input de texto principal */}
          <input
            type="text"
            placeholder="Nombre de la criatura..."
            autoFocus
            className="bg-gray-700/50 border border-gray-600 p-2 rounded-lg flex-grow text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onBlur={() => saveToHistory(query.trim())}
          />

          {/* Selector de CR */}
          <select
            className="bg-gray-800 border border-gray-600 text-yellow-500 p-2 rounded-lg text-xs font-bold focus:outline-none focus:border-yellow-500 cursor-pointer"
            value={selectedCR}
            onChange={(e) => setSelectedCR(e.target.value)}
          >
            <option value="">CR: Todos</option>
            {CR_LEVELS.map((cr) => (
              <option key={cr} value={cr}>
                CR: {cr}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearSearch}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-red-400 active:text-red-400 transition-colors"
            title="Limpiar búsqueda"
          >
            ✖
          </button>

          {/* Botón de crear monstruo */}
          <button
            type="button"
            onClick={() => setIsCreatorOpen(true)}
            className="bg-green-900/50 hover:bg-green-800 p-2 rounded-lg border border-green-700 text-green-400 hover:text-green-300 transition-colors"
            title="Crear Monstruo Personalizado"
          >
            ➕
          </button>
        </div>
      </div>

      {/* HISTORIAL DE BÚSQUEDA */}
      {!query && !selectedCR && searchHistory.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="text-[10px] text-gray-500 uppercase font-bold self-center mr-1">Recientes:</span>
          {searchHistory.map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="text-[11px] bg-gray-800 hover:bg-gray-700 active:bg-gray-700 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full transition-colors"
            >
              🕐 {term}
            </button>
          ))}
          <button
            onClick={() => { setSearchHistory([]); localStorage.removeItem(HISTORY_KEY); }}
            className="text-[10px] text-gray-600 hover:text-red-400 active:text-red-400 px-1"
          >
            Borrar
          </button>
        </div>
      )}

      {/* LISTA DE RESULTADOS */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-1 pb-20">
        {results.map((monster) => (
          <div
            key={`${monster.index}-${monster.isLocal}`}
            className="flex gap-1 group animate-fade-in"
          >
            <button
              onClick={() => onViewStatBlock(monster.index, monster.data)}
              className="flex-grow text-left p-2 rounded hover:bg-gray-700/50 flex justify-between items-center transition-colors border border-transparent hover:border-gray-600"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] w-9 h-5 flex items-center justify-center rounded bg-gray-900 border border-gray-700 font-bold leading-none
  ${monster.isLocal ? "text-yellow-500 border-yellow-900/50" : "text-gray-400"} shadow-sm`}
                >
                  {/* --- NUEVO: Mostramos el CR formateado bonito --- */}
                  {monster.data.challenge_rating !== undefined
                    ? formatCR(monster.data.challenge_rating)
                    : monster.data.cr !== undefined
                      ? formatCR(monster.data.cr)
                      : "-"}
                </span>
                <span
                  className={`text-sm ${monster.isLocal ? "text-yellow-400 font-bold" : "text-gray-200"}`}
                >
                  {monster.name}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300 italic">
                {monster.data.type}
              </span>
            </button>

            <button
               onClick={() => onAddMonster(monster.data)}
               className="p-2 w-10 flex items-center justify-center rounded hover:bg-green-900/50 text-gray-500 hover:text-green-400 border border-transparent hover:border-green-700 transition-colors"
               title="Añadir al combate"
             >
               ⚔️
             </button>

             {monster.isCustom && (
               <button
                 onClick={() => handleDeleteCustomMonster(monster.index)}
                 className="p-2 w-8 flex items-center justify-center rounded hover:bg-red-900/30 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                 title="Borrar definitivamente"
               >
                 🗑️
               </button>
             )}
           </div>
        ))}

        {results.length === 0 && (
          <p className="text-center text-gray-600 mt-4 text-xs italic">
            {query || selectedCR
              ? "No hay criaturas con esos filtros..."
              : "Filtra por nombre o nivel para empezar."}
          </p>
        )}
      </div>

      <MonsterCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onMonsterCreated={handleCustomMonsterCreated}
      />
    </div>
  );
};

export default MonsterSearch;
