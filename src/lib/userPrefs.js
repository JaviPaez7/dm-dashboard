import pb from "./pb";

const DEFAULTS = {
  theme: "fortaleza",
  combat_log_collapsed: false,
  sound_favs: [],
  search_history: [],
};

async function findPrefs(dmId) {
  const rows = await pb.collection("user_prefs").getFullList({
    filter: `dm_id = "${dmId}"`,
  });
  return rows[0] || null;
}

export async function getUserPrefs(dmId) {
  if (!dmId) return { ...DEFAULTS };
  try {
    const row = await findPrefs(dmId);
    if (!row) return { ...DEFAULTS, id: null };
    return {
      id: row.id,
      theme: row.theme || DEFAULTS.theme,
      combat_log_collapsed: !!row.combat_log_collapsed,
      sound_favs: Array.isArray(row.sound_favs) ? row.sound_favs : [],
      search_history: Array.isArray(row.search_history) ? row.search_history : [],
    };
  } catch (err) {
    console.error("Error al cargar preferencias:", err);
    return { ...DEFAULTS, id: null };
  }
}

export async function patchUserPrefs(dmId, patch) {
  if (!dmId) return null;
  try {
    const existing = await findPrefs(dmId);
    if (existing) {
      return await pb.collection("user_prefs").update(existing.id, patch);
    }
    return await pb.collection("user_prefs").create({
      dm_id: dmId,
      ...DEFAULTS,
      ...patch,
    });
  } catch (err) {
    console.error("Error al guardar preferencias:", err);
    return null;
  }
}
