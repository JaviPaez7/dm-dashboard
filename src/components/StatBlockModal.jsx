import React, { useState, useEffect } from "react";

// --- DICCIONARIO INTEGRADO ---
// Lo ponemos aquí para evitar problemas de importaciones
const diccionario = {
  str: "FUE",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
  armor_class: "Clase de Armadura",
  hit_points: "Puntos de Golpe",
  speed: "Velocidad",
  Tiny: "Diminuto",
  Small: "Pequeño",
  Medium: "Mediano",
  Large: "Grande",
  Huge: "Enorme",
  Gargantuan: "Gargantuesco",
  humanoid: "Humanoide",
  beast: "Bestia",
  dragon: "Dragón",
  monstrosity: "Monstruosidad",
  undead: "No Muerto",
  unaligned: "No alineado",
  "lawful good": "Legal Bueno",
  "neutral good": "Neutral Bueno",
  "chaotic evil": "Caótico Malvado",
};
const t = (key) => {
  if (!key) return "";
  return diccionario[key] || key;
};

// --- COMPONENTE PRINCIPAL ---
const StatBlockModal = ({ isOpen, onClose, monsterIndex, localData }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (localData) {
        // Si tenemos los datos locales (Español), los usamos directamente
        setData(localData);
        setLoading(false);
      } else if (monsterIndex) {
        // Si no, los pedimos a la API (Inglés)
        setLoading(true);
        fetch(`https://www.dnd5eapi.co/api/monsters/${monsterIndex}`)
          .then((res) => res.json())
          .then((monsterData) => {
            setData(monsterData);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error cargando ficha:", err);
            setLoading(false);
          });
      }
    } else {
      // Limpiamos los datos al cerrar
      setData(null);
    }
  }, [isOpen, monsterIndex, localData]);

  if (!isOpen) return null;

  // Componente interno para dibujar un atributo (FUE, DES, etc.)
  const Attribute = ({ label, value }) => {
    const safeValue = value || 10; // 10 por defecto si no existe
    const mod = Math.floor((safeValue - 10) / 2);
    const sign = mod >= 0 ? "+" : "";
    return (
      <div className="flex flex-col items-center p-2 bg-gray-900 rounded border border-gray-700">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {t(label)}
        </span>
        <span className="text-lg font-bold text-yellow-500 font-fantasy">
          {safeValue}
        </span>
        <span className="text-xs text-gray-400">
          ({sign}
          {mod})
        </span>
      </div>
    );
  };

  // Funciones de extracción segura (para que no explote si el formato es distinto)
  const getAC = () => data.ac || data.armor_class?.[0]?.value || 10;
  const getHP = () => data.hp || data.hit_points || 10;
  const getSpeed = () => {
    if (typeof data.speed === "string") return data.speed; // Formato Español
    if (typeof data.speed === "object")
      return Object.entries(data.speed)
        .map(([k, v]) => `${t(k)} ${v}`)
        .join(", "); // Formato API
    return "30 ft";
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1c23] text-gray-200 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] overflow-y-auto relative font-sans border border-yellow-700/50 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-3xl font-bold transition-colors z-10"
        >
          &times;
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-full text-yellow-500 animate-pulse font-fantasy text-xl">
            Invocando pergamino...
          </div>
        ) : data ? (
          <div className="p-6 md:p-8">
            {/* Cabecera */}
            <h2 className="text-3xl font-bold text-yellow-500 font-fantasy border-b border-yellow-700/50 pb-2 mb-1 capitalize">
              {data.name}
            </h2>
            <p className="italic text-gray-400 mb-6 text-sm">
              {t(data.size)} {t(data.type)}, {t(data.alignment)}
            </p>

            {/* Barra de Estadísticas Vitales */}
            <div className="bg-red-900/20 border-y border-red-900/40 py-3 px-4 mb-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="block text-xs text-red-400 font-bold uppercase tracking-wider">
                  AC
                </span>
                <span className="text-xl font-bold text-white">{getAC()}</span>
              </div>
              <div>
                <span className="block text-xs text-green-400 font-bold uppercase tracking-wider">
                  HP
                </span>
                <span className="text-xl font-bold text-white">{getHP()}</span>
              </div>
              <div>
                <span className="block text-xs text-yellow-400 font-bold uppercase tracking-wider">
                  Velocidad
                </span>
                <span className="text-sm text-white block mt-1 leading-tight">
                  {getSpeed()}
                </span>
              </div>
            </div>

            {/* Cuadrícula de Atributos */}
            <div className="grid grid-cols-6 gap-2 mb-8">
              <Attribute
                label="str"
                value={data.stats ? data.stats.str : data.strength}
              />
              <Attribute
                label="dex"
                value={data.stats ? data.stats.dex : data.dexterity}
              />
              <Attribute
                label="con"
                value={data.stats ? data.stats.con : data.constitution}
              />
              <Attribute
                label="int"
                value={data.stats ? data.stats.int : data.intelligence}
              />
              <Attribute
                label="wis"
                value={data.stats ? data.stats.wis : data.wisdom}
              />
              <Attribute
                label="cha"
                value={data.stats ? data.stats.cha : data.charisma}
              />
            </div>

            {/* Acciones */}
            <h3 className="text-xl font-bold text-yellow-500 font-fantasy border-b border-gray-700 mb-4 pb-1">
              Acciones
            </h3>
            <div className="space-y-4 text-sm leading-relaxed text-gray-300">
              {data.actions?.map((action, i) => (
                <div key={i} className="pl-4 border-l-2 border-gray-700">
                  <span className="font-bold text-gray-100 block mb-1">
                    {action.name}
                  </span>
                  <span className="text-gray-400">{action.desc}</span>
                </div>
              ))}
              {!data.actions && (
                <p className="text-gray-500 italic">
                  No tiene acciones registradas.
                </p>
              )}
            </div>

            {/* Habilidades Especiales (Solo si tiene) */}
            {data.special_abilities?.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-yellow-500 font-fantasy border-b border-gray-700 mt-8 mb-4 pb-1">
                  Habilidades
                </h3>
                <div className="space-y-3 text-sm text-gray-300">
                  {data.special_abilities.map((ability, i) => (
                    <div key={i}>
                      <span className="font-bold text-gray-100">
                        {ability.name}.
                      </span>{" "}
                      <span className="text-gray-400">{ability.desc}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">
            El pergamino está en blanco.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatBlockModal;
