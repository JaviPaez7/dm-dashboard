export const adaptarMonstruoSRD = (monstruo) => {
  let armorClass = 10;
  if (Array.isArray(monstruo.armor_class)) {
    armorClass = monstruo.armor_class[0]?.value || 10;
  } else if (typeof monstruo.armor_class === "number") {
    armorClass = monstruo.armor_class;
  }

  return {
    index: monstruo.index,
    name: monstruo.name,
    type: monstruo.type,
    alignment: monstruo.alignment,
    ac: armorClass,
    hp: monstruo.hit_points,
    challenge_rating: monstruo.challenge_rating,

    stats: {
      str: monstruo.strength,
      dex: monstruo.dexterity,
      con: monstruo.constitution,
      int: monstruo.intelligence,
      wis: monstruo.wisdom,
      cha: monstruo.charisma,
    },
    speed: monstruo.speed,
    languages: monstruo.languages,
    senses: monstruo.senses,
    actions: monstruo.actions,
    special_abilities: monstruo.special_abilities,
    legendary_actions: monstruo.legendary_actions,
    isLocal: true,
  };
};
