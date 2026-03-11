// src/utils/traductor.js

export const diccionario = {
  // Atributos
  str: "FUE",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",

  // Etiquetas Generales
  armor_class: "Clase de Armadura",
  hit_points: "Puntos de Golpe",
  speed: "Velocidad",
  senses: "Sentidos",
  languages: "Idiomas",
  challenge_rating: "Desafío",
  xp: "XP",

  // Tipos de movimiento
  walk: "Caminar",
  fly: "Vuelo",
  swim: "Nado",
  climb: "Escalar",
  burrow: "Excavar",

  // Tamaños
  Tiny: "Diminuto",
  Small: "Pequeño",
  Medium: "Mediano",
  Large: "Grande",
  Huge: "Enorme",
  Gargantuan: "Gargantuesco",

  // Tipos de monstruo
  humanoid: "Humanoide",
  beast: "Bestia",
  dragon: "Dragón",
  monstrosity: "Monstruosidad",
  undead: "No Muerto",
  fiend: "Infernal",
  celestial: "Celestial",
  construct: "Constructo",
  elemental: "Elemental",
  fey: "Feérico",
  giant: "Gigante",
  aberration: "Aberración",

  // Alineamientos
  unaligned: "No alineado",
  "lawful good": "Legal Bueno",
  "neutral good": "Neutral Bueno",
  "chaotic good": "Caótico Bueno",
  "lawful neutral": "Legal Neutral",
  neutral: "Neutral",
  "chaotic neutral": "Caótico Neutral",
  "lawful evil": "Legal Malvado",
  "neutral evil": "Neutral Malvado",
  "chaotic evil": "Caótico Malvado",
};

// Función helper para traducir
export const t = (key) => {
  if (!key) return "";
  const k = key.toString().toLowerCase();
  return diccionario[k] || key; // Si no encuentra traducción, devuelve el original
};
