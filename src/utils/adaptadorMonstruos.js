// Esta función convierte el formato complejo del SRD al formato sencillo de tu App
export const adaptarMonstruoSRD = (monstruo) => {
  // 1. Gestionar la Armadura (A veces es un número, a veces un array)
  let armorClass = 10;
  if (Array.isArray(monstruo.armor_class)) {
    armorClass = monstruo.armor_class[0]?.value || 10;
  } else if (typeof monstruo.armor_class === "number") {
    armorClass = monstruo.armor_class;
  }

  // 2. Devolver el objeto con la estructura que tu App espera
  return {
    index: monstruo.index,
    name: monstruo.name, // Si el JSON original está en inglés, esto saldrá en inglés
    type: monstruo.type,
    ac: armorClass,
    hp: monstruo.hit_points,
    // Tu app espera 'stats', pero el SRD los tiene sueltos. Los agrupamos:
    stats: {
      str: monstruo.strength,
      dex: monstruo.dexterity,
      con: monstruo.constitution,
      int: monstruo.intelligence,
      wis: monstruo.wisdom,
      cha: monstruo.charisma,
    },
    speed: monstruo.speed, // Tu modal ya sabe leer esto
    actions: monstruo.actions,
    special_abilities: monstruo.special_abilities,
    legendary_actions: monstruo.legendary_actions,
    isLocal: true, // Marcamos como local para que no busque en internet
  };
};
