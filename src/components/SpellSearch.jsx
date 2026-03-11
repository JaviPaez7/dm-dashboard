import React, { useState, useEffect } from "react";
import { grimorioCompleto } from "../data/grimorio_completo";

const SPELL_LEVELS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const SpellSearch = () => {
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(""); // Nuevo estado para el filtro
  const [results, setResults] = useState([]);
  const [selectedSpell, setSelectedSpell] = useState(null);

  // --- BUSCADOR EN VIVO (Sustituye al antiguo searchSpells) ---
  useEffect(() => {
    // Si no hay búsqueda ni filtro, limpiamos resultados y cerramos la carta
    if (!query.trim() && !selectedLevel) {
      setResults([]);
      if (!selectedSpell) return; // Mantenemos la carta abierta si la está leyendo
    }

    const delayDebounceFn = setTimeout(() => {
      const queryLower = query.toLowerCase();

      const found = grimorioCompleto.filter((spell) => {
        const nombre = spell.name || spell.nombre || "";
        const level = spell.level !== undefined ? spell.level.toString() : "";

        const matchesName = nombre.toLowerCase().includes(queryLower);
        const matchesLevel = !selectedLevel || level === selectedLevel;

        return matchesName && matchesLevel;
      });

      setResults(found.slice(0, 30));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedLevel]);

  // --- FUNCIONES DE SEGURIDAD (Intactas) ---
  const getText = (obj, keys) => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        if (typeof obj[key] === "object" && obj[key].name) return obj[key].name;
        if (Array.isArray(obj[key])) return obj[key].join(", ");
        return String(obj[key]);
      }
    }
    return "---";
  };

  const renderDescription = (obj) => {
    const val =
      obj.desc || obj.descripcion || obj.description || "Sin descripción.";
    if (Array.isArray(val)) {
      return val.map((p, i) => (
        <p key={i} className="mb-2 last:mb-0 text-gray-300">
          {p}
        </p>
      ));
    }
    return <p className="text-gray-300 whitespace-pre-line">{String(val)}</p>;
  };

  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2 lg:hidden font-fantasy">
        <span>✨</span> Grimorio
      </h2>

      {/* --- NUEVA BARRA DE BÚSQUEDA Y FILTRO --- */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar conjuro..."
            className="bg-gray-700/50 border border-gray-600 p-2 rounded-lg flex-grow w-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedSpell(null); // Cerramos la carta al escribir para ver resultados
            }}
          />

          <select
            className="bg-gray-800 border border-gray-600 text-purple-400 p-2 rounded-lg text-xs font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setSelectedSpell(null); // Cerramos la carta al filtrar
            }}
          >
            <option value="">Niv: Todos</option>
            {SPELL_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl === "0" ? "Truco" : `Nvl ${lvl}`}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setQuery("");
              setSelectedLevel("");
              setSelectedSpell(null);
            }}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-red-400 transition-colors"
          >
            ✖
          </button>
        </div>
      </div>

      {/* --- ÁREA DE RESULTADOS --- */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {selectedSpell ? (
          // --- TU TARJETA DE DETALLE ORIGINAL ---
          <div className="bg-[#1a1c23] p-4 rounded border border-purple-500/30 animate-fade-in shadow-xl relative">
            <div className="flex justify-between items-start mb-2 border-b border-purple-500/20 pb-2">
              <div>
                <h3 className="text-xl font-bold text-purple-400 font-fantasy capitalize">
                  {getText(selectedSpell, ["name", "nombre"])}
                </h3>
                <div className="text-xs text-purple-300 italic capitalize">
                  Nivel {getText(selectedSpell, ["level", "nivel"])} -{" "}
                  {getText(selectedSpell, ["school", "escuela"])}
                </div>
              </div>
              <button
                onClick={() => setSelectedSpell(null)}
                className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-gray-900/50 p-2 rounded border border-gray-700/50">
              <div>
                <span className="text-gray-500 font-bold uppercase">
                  Tiempo:{" "}
                </span>
                <span className="text-gray-300 block">
                  {getText(selectedSpell, [
                    "casting_time",
                    "tiempo_lanzamiento",
                  ])}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase">
                  Rango:{" "}
                </span>
                <span className="text-gray-300 block">
                  {getText(selectedSpell, ["range", "alcance"])}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase">
                  Compo:{" "}
                </span>
                <span className="text-gray-300 block truncate">
                  {getText(selectedSpell, ["components", "componentes"])}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase">
                  Duración:{" "}
                </span>
                <span className="text-gray-300 block">
                  {getText(selectedSpell, ["duration", "duracion"])}
                </span>
              </div>
            </div>

            <div className="text-sm leading-relaxed max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {renderDescription(selectedSpell)}

              {(selectedSpell.higher_level || selectedSpell.nivel_superior) && (
                <div className="mt-3 pt-2 border-t border-gray-700 bg-purple-900/10 p-2 rounded">
                  <span className="font-bold text-purple-400 block mb-1 text-xs uppercase">
                    En niveles superiores:
                  </span>
                  <p className="text-gray-300">
                    {getText(selectedSpell, ["higher_level", "nivel_superior"])}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // --- TU LISTA DE RESULTADOS ORIGINAL (Adaptada visualmente) ---
          <ul className="space-y-1">
            {results.map((spell, idx) => (
              <li key={spell.index || idx} className="animate-fade-in">
                <button
                  onClick={() => setSelectedSpell(spell)}
                  className="w-full text-left p-2 rounded hover:bg-gray-700/50 flex justify-between items-center group transition-colors border border-transparent hover:border-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-6 h-5 flex items-center justify-center rounded bg-purple-900/30 border border-purple-700/50 text-purple-400 font-bold leading-none">
                      {getText(spell, ["level", "nivel"])}
                    </span>
                    <span className="font-medium text-purple-400 font-bold capitalize">
                      {getText(spell, ["name", "nombre"])}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-purple-300">
                    Leer →
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && (query || selectedLevel) && (
              <p className="text-center text-gray-600 mt-4 text-xs italic">
                No se encontró ese conjuro.
              </p>
            )}
            {results.length === 0 && !query && !selectedLevel && (
              <p className="text-center text-gray-600 mt-4 text-xs italic">
                El grimorio está abierto...
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SpellSearch;
