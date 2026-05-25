import React, { useState, useEffect } from "react";

// --- DICCIONARIO INTEGRADO ---
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
        setData(localData);
        setLoading(false);
      } else if (monsterIndex) {
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
      setData(null);
    }
  }, [isOpen, monsterIndex, localData]);

  if (!isOpen) return null;

  // Componente interno para dibujar un atributo (FUE, DES, etc.)
  const Attribute = ({ label, value }) => {
    const safeValue = value ?? 10;
    const mod = Math.floor((safeValue - 10) / 2);
    const sign = mod >= 0 ? "+" : "";
    return (
      <div className="flex flex-col items-center text-center">
        <span className="text-xs font-bold text-[#7a2008] uppercase tracking-wider">
          {t(label)}
        </span>
        <span className="text-sm font-bold text-[#2b1810]">
          {safeValue} <span className="font-normal text-xs text-[#4e3629]/80">({sign}{mod})</span>
        </span>
      </div>
    );
  };

  // Funciones de extracción segura
  const getAC = () => data.ac ?? data.armor_class?.[0]?.value ?? 10;
  const getHP = () => data.hp ?? data.hit_points ?? 10;
  
  const getSpeed = () => {
    if (typeof data.speed === "string") return data.speed;
    if (typeof data.speed === "object")
      return Object.entries(data.speed)
        .map(([k, v]) => `${t(k)} ${v}`)
        .join(", ");
    return "30 ft";
  };

  const getCR = () => data.cr ?? data.challenge_rating ?? "0";
  
  const getSenses = () => {
    if (typeof data.senses === "object") {
      return Object.entries(data.senses)
        .map(([k, v]) => `${t(k)} ${v}`)
        .join(", ");
    }
    return data.senses || "Pasiva 10";
  };

  const getLanguages = () => data.languages || "—";

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#fdf1dc] text-[#2b1810] rounded border-t-8 border-b-8 border-x-2 border-[#7a2008] shadow-[0_0_30px_rgba(0,0,0,0.5)] w-full max-w-xl max-h-[85vh] overflow-y-auto relative font-serif custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-[#7a2008] hover:text-red-700 text-3xl font-bold transition-colors z-10 select-none"
        >
          &times;
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#7a2008] animate-pulse font-fantasy text-xl">
            Invocando pergamino...
          </div>
        ) : data ? (
          <div className="p-5 md:p-7 text-left">
            {/* Cabecera */}
            <h2 className="text-2xl md:text-3xl font-bold text-[#7a2008] font-fantasy capitalize tracking-wide leading-tight">
              {data.name}
            </h2>
            <p className="italic text-[#4e3629] text-xs md:text-sm mt-0.5">
              {t(data.size)} {t(data.type)}, {t(data.alignment)}
            </p>

            {/* Separador */}
            <div className="h-[3px] bg-[#7a2008] my-2" />

            {/* Estadísticas Básicas */}
            <div className="text-xs md:text-sm space-y-1 text-[#2b1810]">
              <div>
                <span className="font-bold text-[#7a2008]">Clase de Armadura</span>{" "}
                <span className="text-[#4e3629]">{getAC()}</span>
              </div>
              <div>
                <span className="font-bold text-[#7a2008]">Puntos de Golpe</span>{" "}
                <span className="text-[#4e3629]">{getHP()}</span>
              </div>
              <div>
                <span className="font-bold text-[#7a2008]">Velocidad</span>{" "}
                <span className="text-[#4e3629]">{getSpeed()}</span>
              </div>
            </div>

            {/* Separador */}
            <div className="h-[3px] bg-[#7a2008] my-2" />

            {/* Cuadrícula de Atributos */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 py-2 border-y border-[#7a2008]/40 my-3 bg-[#f5e6cd]/30 rounded-sm">
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

            {/* Información Secundaria */}
            <div className="text-xs md:text-sm space-y-1 text-[#2b1810] border-b border-[#7a2008]/40 pb-2.5 my-3">
              {data.saving_throws && (
                <div>
                  <span className="font-bold text-[#7a2008]">Tiradas de Salvación</span>{" "}
                  <span className="text-[#4e3629]">{data.saving_throws}</span>
                </div>
              )}
              {data.skills && (
                <div>
                  <span className="font-bold text-[#7a2008]">Habilidades</span>{" "}
                  <span className="text-[#4e3629]">{data.skills}</span>
                </div>
              )}
              <div>
                <span className="font-bold text-[#7a2008]">Sentidos</span>{" "}
                <span className="text-[#4e3629]">{getSenses()}</span>
              </div>
              <div>
                <span className="font-bold text-[#7a2008]">Idiomas</span>{" "}
                <span className="text-[#4e3629]">{getLanguages()}</span>
              </div>
              <div>
                <span className="font-bold text-[#7a2008]">Desafío (CR)</span>{" "}
                <span className="text-[#4e3629]">{getCR()}</span>
              </div>
            </div>

            {/* Habilidades Especiales */}
            {data.special_abilities && data.special_abilities.length > 0 && (
              <div className="my-4 space-y-2 text-xs md:text-sm text-[#2b1810] leading-relaxed">
                {data.special_abilities.map((ability, i) => (
                  <div key={i}>
                    <span className="font-bold font-fantasy italic text-[#2b1810]">
                      {ability.name}.
                    </span>{" "}
                    <span className="text-[#4e3629]">{ability.desc || ability.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Acciones */}
            <h3 className="text-base md:text-lg font-bold text-[#7a2008] font-fantasy border-b border-[#7a2008]/40 mb-2 pb-0.5 tracking-wider uppercase mt-4">
              Acciones
            </h3>
            <div className="space-y-3 text-xs md:text-sm text-[#2b1810] leading-relaxed">
              {data.actions?.map((action, i) => (
                <div key={i}>
                  <span className="font-bold font-fantasy italic text-[#2b1810]">
                    {action.name}.
                  </span>{" "}
                  <span className="text-[#4e3629]">{action.desc || action.description}</span>
                </div>
              ))}
              {(!data.actions || data.actions.length === 0) && (
                <p className="text-gray-500 italic">No tiene acciones registradas.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-[#7a2008] italic">
            El pergamino está en blanco.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatBlockModal;
