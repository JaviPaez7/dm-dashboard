import React, { useState, useEffect } from "react";
import { bestiarioES } from "../data/monstruos_es";
import { bestiarioSRD } from "../data/monstruos_srd";
import { adaptarMonstruoSRD } from "../utils/adaptadorMonstruos";

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

const MonsterSearch = ({ onAddMonster, onViewStatBlock }) => {
  const [query, setQuery] = useState("");
  const [selectedCR, setSelectedCR] = useState(""); // Estado para el filtro de nivel
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Si no hay texto ni CR seleccionado, limpiamos
    if (!query.trim() && !selectedCR) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const queryLower = query.toLowerCase();

      // Función de ayuda para filtrar
      const filterLogic = (m) => {
        const matchesName = m.name.toLowerCase().includes(queryLower);
        // El CR puede venir como número (5) o string ("1/2"). Lo pasamos a string para comparar.
        const matchesCR =
          !selectedCR || m.challenge_rating?.toString() === selectedCR;
        return matchesName && matchesCR;
      };

      // 1. Manuales (Prioridad)
      const manualMatches = bestiarioES
        .filter(filterLogic)
        .map((m) => ({ index: m.index, name: m.name, isLocal: true, data: m }));

      // 2. SRD Traducido (Sin duplicados del manual)
      const srdMatches = bestiarioSRD
        .filter(filterLogic)
        .filter(
          (m) => !manualMatches.some((manual) => manual.index === m.index),
        )
        .map((m) => {
          const adaptado = adaptarMonstruoSRD(m);
          return {
            index: adaptado.index,
            name: adaptado.name,
            isLocal: false,
            data: adaptado,
          };
        });

      setResults([...manualMatches, ...srdMatches].slice(0, 40));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedCR]); // <--- Ahora vigila también el CR

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
            onChange={(e) => setQuery(e.target.value)}
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

          {/* Botón de limpiar */}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCR("");
            }}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-red-400 transition-colors"
          >
            ✖
          </button>
        </div>
      </div>

      {/* LISTA DE RESULTADOS */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-1">
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
                  className={`text-[10px] w-8 h-5 flex items-center justify-center rounded bg-gray-900 border border-gray-700 font-bold ${monster.isLocal ? "text-yellow-500" : "text-gray-400"}`}
                >
                  {monster.data.challenge_rating}
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
            >
              ⚔️
            </button>
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
    </div>
  );
};

export default MonsterSearch;
