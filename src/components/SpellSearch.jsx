import React, { useState, useEffect } from "react";
import { grimorioCompleto } from "../data/grimorio_completo";

const SPELL_LEVELS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const CLASSES = [
  "Bardo",
  "Clérigo",
  "Druida",
  "Paladín",
  "Explorador",
  "Hechicero",
  "Brujo",
  "Mago",
];

const SpellSearch = () => {
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSpell, setSelectedSpell] = useState(null);

  useEffect(() => {
    // Si no hay nada filtrado, no mostramos nada para no saturar
    if (!query.trim() && !selectedLevel && !selectedClass) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const queryLower = query.toLowerCase();

      const found = grimorioCompleto.filter((spell) => {
        // --- LA MAGIA BILINGÜE ---
        // 1. Nombre en Español
        const nombreES = (spell.name || spell.nombre || "").toLowerCase();
        // 2. Nombre en Inglés (index) reemplazando guiones por espacios
        const nombreEN = (spell.index || "").toLowerCase().replace(/-/g, " ");

        const level = spell.level !== undefined ? spell.level.toString() : "";

        // Filtro de Clase (Ignora mayúsculas/minúsculas)
        const matchesClass =
          !selectedClass ||
          (spell.classes &&
            spell.classes.some((c) => {
              const className = (
                typeof c === "object" ? c.name || c.index : c
              ).toLowerCase();
              return className === selectedClass.toLowerCase();
            }));

        // Coincide si lo que escribimos está en español O en inglés
        const matchesName =
          nombreES.includes(queryLower) || nombreEN.includes(queryLower);
        const matchesLevel = !selectedLevel || level === selectedLevel;

        return matchesName && matchesLevel && matchesClass;
      });

      setResults(
        found
          .sort((a, b) => {
            const nameA = (a.name || a.nombre || "").toLowerCase();
            const nameB = (b.name || b.nombre || "").toLowerCase();
            return nameA.localeCompare(nameB);
          })
          .slice(0, 30)
      );
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedLevel, selectedClass]);

  // --- TUS FUNCIONES DE SEGURIDAD ---
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
        <p key={i} className="mb-2 text-gray-300">
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

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Nombre (Ej: Fireball o Bola de fuego)..."
          className="bg-gray-700/50 border border-gray-600 p-2 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedSpell(null);
          }}
        />

        <div className="flex gap-2">
          <select
            className="bg-gray-800 border border-gray-600 text-purple-400 p-2 rounded-lg text-xs font-bold flex-grow cursor-pointer"
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setSelectedSpell(null);
            }}
          >
            <option value="">Niveles: Todos</option>
            {SPELL_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl === "0" ? "Trucos" : `Nivel ${lvl}`}
              </option>
            ))}
          </select>

          <select
            className="bg-gray-800 border border-gray-600 text-blue-400 p-2 rounded-lg text-xs font-bold flex-grow cursor-pointer"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSpell(null);
            }}
          >
            <option value="">Clases: Todas</option>
            {CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setQuery("");
              setSelectedLevel("");
              setSelectedClass("");
              setSelectedSpell(null);
            }}
            className="bg-gray-800 hover:bg-gray-700 px-3 rounded-lg border border-gray-600 text-gray-400"
          >
            ✖
          </button>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {selectedSpell ? (
          /* TU TARJETA DE DETALLE ORIGINAL */
          <div className="bg-[#1a1c23] p-4 rounded border border-purple-500/30 animate-fade-in shadow-xl relative">
            <div className="flex justify-between items-start mb-2 border-b border-purple-500/20 pb-2">
              <div>
                <h3 className="text-xl font-bold text-purple-400 font-fantasy capitalize">
                  {getText(selectedSpell, ["name", "nombre"])}
                </h3>
                <div className="text-xs text-purple-300 italic">
                  Nivel {getText(selectedSpell, ["level", "nivel"])} -{" "}
                  {getText(selectedSpell, ["school", "escuela"])}
                </div>
              </div>
              <button
                onClick={() => setSelectedSpell(null)}
                className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded border border-gray-700"
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
            </div>
          </div>
        ) : (
          /* LISTA DE RESULTADOS */
          <ul className="space-y-1">
            {results.map((spell, idx) => (
              <li key={spell.index || idx} className="animate-fade-in">
                <button
                  onClick={() => setSelectedSpell(spell)}
                  className="w-full text-left p-2 rounded hover:bg-gray-700/50 flex justify-between items-center group transition-colors border border-transparent hover:border-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-6 h-5 flex items-center justify-center rounded bg-purple-900/30 border border-purple-700/50 text-purple-400 font-bold">
                      {getText(spell, ["level", "nivel"])}
                    </span>
                    <span className="font-medium text-purple-400 font-bold capitalize">
                      {getText(spell, ["name", "nombre"])}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 italic">
                    {spell.classes?.map((c) => c.name || c).join(", ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SpellSearch;
