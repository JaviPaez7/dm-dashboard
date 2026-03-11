import React, { useState } from "react";
import { grimorioCompleto } from "../data/grimorio_completo";

const SpellSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSpell, setSelectedSpell] = useState(null);

  // --- BUSCADOR ---
  const searchSpells = (e) => {
    e.preventDefault();
    if (!query) return;

    const queryLower = query.toLowerCase();

    // Buscamos en nombre (inglés o español)
    const found = grimorioCompleto.filter((spell) => {
      const nombre = spell.name || spell.nombre || "";
      return nombre.toLowerCase().includes(queryLower);
    });

    setResults(found.slice(0, 20));
    setSelectedSpell(null);
  };

  // --- FUNCIONES DE SEGURIDAD (Para evitar crasheos) ---

  // 1. Obtener texto simple de varias posibles claves
  const getText = (obj, keys) => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        // Si es un objeto (ej: school: {name: "Evocation"}), sacamos el name
        if (typeof obj[key] === "object" && obj[key].name) return obj[key].name;
        // Si es un array (ej: components: ["V", "S"]), lo unimos
        if (Array.isArray(obj[key])) return obj[key].join(", ");
        return String(obj[key]);
      }
    }
    return "---";
  };

  // 2. Renderizar descripción (Maneja Arrays y Strings)
  const renderDescription = (obj) => {
    // Busca en todas las claves posibles
    const val =
      obj.desc || obj.descripcion || obj.description || "Sin descripción.";

    // Si es un array (párrafos), los mapeamos
    if (Array.isArray(val)) {
      return val.map((p, i) => (
        <p key={i} className="mb-2 last:mb-0 text-gray-300">
          {p}
        </p>
      ));
    }

    // Si es un string, lo devolvemos tal cual (soportando saltos de línea)
    return <p className="text-gray-300 whitespace-pre-line">{String(val)}</p>;
  };

  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      {/* Título Móvil */}
      <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2 lg:hidden font-fantasy">
        <span>✨</span> Grimorio
      </h2>

      {/* Buscador */}
      <form onSubmit={searchSpells} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar conjuro..."
          className="bg-gray-700/50 border border-gray-600 p-2 rounded w-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-arcane px-4 rounded font-bold">
          ✨
        </button>
      </form>

      {/* Área de Resultados */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {selectedSpell ? (
          // --- TARJETA DE DETALLE BLINDADA ---
          <div className="bg-[#1a1c23] p-4 rounded border border-purple-500/30 animate-fade-in shadow-xl relative">
            <div className="flex justify-between items-start mb-2 border-b border-purple-500/20 pb-2">
              <div>
                <h3 className="text-xl font-bold text-purple-400 font-fantasy">
                  {getText(selectedSpell, ["name", "nombre"])}
                </h3>
                <div className="text-xs text-purple-300 italic">
                  {/* Usamos getText para manejar si school es objeto o texto */}
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

            {/* Grid de Datos Técnicos */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-gray-900/50 p-2 rounded border border-gray-700/50">
              <div>
                <span className="text-gray-500 font-bold uppercase">
                  Tiempo:
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
                  Rango:
                </span>
                <span className="text-gray-300 block">
                  {getText(selectedSpell, ["range", "alcance"])}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase">
                  Compo:
                </span>
                <span className="text-gray-300 block truncate">
                  {getText(selectedSpell, ["components", "componentes"])}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase">
                  Duración:
                </span>
                <span className="text-gray-300 block">
                  {getText(selectedSpell, ["duration", "duracion"])}
                </span>
              </div>
            </div>

            {/* Descripción Segura */}
            <div className="text-sm leading-relaxed max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {renderDescription(selectedSpell)}

              {/* Niveles superiores */}
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
          // --- LISTA DE RESULTADOS ---
          <ul className="space-y-1">
            {results.map((spell, idx) => (
              <li key={spell.index || idx} className="animate-fade-in">
                <button
                  onClick={() => setSelectedSpell(spell)}
                  className="w-full text-left p-2 rounded hover:bg-gray-700/50 flex justify-between items-center group transition-colors border border-transparent hover:border-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-purple-400 font-bold">
                      {getText(spell, ["name", "nombre"])}
                    </span>
                    <span className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-600">
                      Nvl {getText(spell, ["level", "nivel"])}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-purple-300">
                    Leer →
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && query !== "" && (
              <p className="text-center text-gray-600 mt-4 text-xs italic">
                No se encontró ese conjuro.
              </p>
            )}
            {results.length === 0 && query === "" && (
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
