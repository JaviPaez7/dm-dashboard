import React, { useState, useEffect, useRef } from "react";
import pb from "../lib/pb";
import { useAuth } from "../context/AuthContext";

const Notepad = () => {
  const [note, setNote] = useState("");
  const { user } = useAuth();
  const timeoutRef = useRef(null);
  const noteIdRef = useRef(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!user || user.isAnonymous) {
        setNote("");
        noteIdRef.current = null;
        return;
      }

      try {
        const rows = await pb.collection("dm_notes").getFullList({
          filter: `dm_id = "${user.id}"`,
        });
        if (rows.length > 0) {
          noteIdRef.current = rows[0].id;
          setNote(rows[0].content || "");
        } else {
          noteIdRef.current = null;
          setNote("");
        }
      } catch (error) {
        console.error("Error al cargar nota de PocketBase:", error);
      }
    };

    fetchNote();
  }, [user]);

  const handleChange = (e) => {
    const text = e.target.value;
    setNote(text);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (!user || user.isAnonymous) return;
      try {
        if (noteIdRef.current) {
          await pb.collection("dm_notes").update(noteIdRef.current, {
            content: text,
          });
        } else {
          const created = await pb.collection("dm_notes").create({
            dm_id: user.id,
            content: text,
          });
          noteIdRef.current = created.id;
        }
      } catch (error) {
        console.error("Error al guardar nota en PocketBase:", error);
      }
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      <h2 className="text-xl font-bold mb-4 text-gray-400 flex items-center gap-2 font-fantasy">
        <span>📜</span> Notas del DM
      </h2>
      {user?.isAnonymous && (
        <p className="text-xs text-amber-400 mb-2">
          Inicia sesión con una cuenta para guardar tus notas en la nube.
        </p>
      )}
      <textarea
        className="flex-grow w-full bg-gray-900/50 text-gray-300 p-4 rounded-lg border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none resize-none font-sans text-sm leading-relaxed custom-scrollbar shadow-inner"
        placeholder="Escribe aquí recordatorios, nombres de NPCs improvisados o tesoros ocultos..."
        value={note}
        onChange={handleChange}
        disabled={user?.isAnonymous}
      />
      <div className="mt-2 text-xs text-gray-600 text-right italic">
        {user?.isAnonymous ? "Solo disponible con cuenta" : "Se guarda automáticamente en tu cuenta"}
      </div>
    </div>
  );
};

export default Notepad;
