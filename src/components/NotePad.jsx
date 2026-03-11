import React, { useState, useEffect } from "react";

const Notepad = () => {
  const [note, setNote] = useState("");

  // Cargar nota guardada al iniciar
  useEffect(() => {
    const savedNote = localStorage.getItem("dm_notepad");
    if (savedNote) setNote(savedNote);
  }, []);

  // Guardar cada vez que escribes
  const handleChange = (e) => {
    const text = e.target.value;
    setNote(text);
    localStorage.setItem("dm_notepad", text);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      <h2 className="text-xl font-bold mb-4 text-gray-400 flex items-center gap-2 font-fantasy">
        <span>📜</span> Notas del DM
      </h2>
      <textarea
        className="flex-grow w-full bg-gray-900/50 text-gray-300 p-4 rounded-lg border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none resize-none font-sans text-sm leading-relaxed custom-scrollbar shadow-inner"
        placeholder="Escribe aquí recordatorios, nombres de NPCs improvisados o tesoros ocultos..."
        value={note}
        onChange={handleChange}
      />
      <div className="mt-2 text-xs text-gray-600 text-right italic">
        Se guarda automáticamente
      </div>
    </div>
  );
};

export default Notepad;
