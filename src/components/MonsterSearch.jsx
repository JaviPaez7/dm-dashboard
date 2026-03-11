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

const MonsterSearch = ({ onAddMonster, onViewStatBlock }) => {
  const [query, setQuery] = useState("");
  const [selectedCR, setSelectedCR] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim() && !selectedCR) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const queryLower = query.toLowerCase();

      // Función de ayuda para filtrar
      const filterLogic = (m) => {
        // 1. Nombre en Español (o el que traiga el manual)
        const nombreES = (m.name || "").toLowerCase();

        // 2. Nombre en Inglés (usando el index).
        // Reemplazamos los guiones por espacios para que "red dragon" encuentre "red-dragon"
        const nombreEN = (m.index || "").toLowerCase().replace(/-/g, " ");

        // Si lo que escribes coincide con el español O con el inglés, lo muestra
        const matchesName =
          nombreES.includes(queryLower) || nombreEN.includes(queryLower);

        // --- LÓGICA DE CR CORREGIDA ---
        let matchesCR = true;
        if (selectedCR) {
          // Si el CR seleccionado es una fracción (ej: "1/4"), buscamos su equivalente decimal (0.25)
          const decimalTarget = crToDecimal[selectedCR];
          const monsterCR = m.challenge_rating ?? m.cr;

          if (decimalTarget !== undefined) {
            // Si es fracción, comparamos con el decimal o con el texto por si acaso
            matchesCR = monsterCR === decimalTarget || monsterCR === selectedCR;
          } else {
            // Si es número entero, comparamos pasándolo a string
            matchesCR = monsterCR?.toString() === selectedCR;
          }
        }

        return matchesName && matchesCR;
      };;

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
