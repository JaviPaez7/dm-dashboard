import React, { useState } from "react";

// Definimos los colores específicos para cada dado
const DICE_TYPES = [
  {
    label: "d4",
    sides: 4,
    colorClass:
      "!text-green-400 !border-green-500/50 !border-2 hover:!border-green-400 hover:shadow-[0_0_15px_rgba(74,222,128,0.5)] bg-green-900/20",
  },
  {
    label: "d6",
    sides: 6,
    colorClass:
      "!text-blue-400 !border-blue-500/50 !border-2 hover:!border-blue-400 hover:shadow-[0_0_15px_rgba(96,165,250,0.5)] bg-blue-900/20",
  },
  {
    label: "d8",
    sides: 8,
    colorClass:
      "!text-purple-400 !border-purple-500/50 !border-2 hover:!border-purple-400 hover:shadow-[0_0_15px_rgba(192,132,252,0.5)] bg-purple-900/20",
  },
  {
    label: "d10",
    sides: 10,
    colorClass:
      "!text-pink-400 !border-pink-500/50 !border-2 hover:!border-pink-400 hover:shadow-[0_0_15px_rgba(244,114,182,0.5)] bg-pink-900/20",
  },
  {
    label: "d12",
    sides: 12,
    colorClass:
      "!text-orange-400 !border-orange-500/50 !border-2 hover:!border-orange-400 hover:shadow-[0_0_15px_rgba(251,146,60,0.5)] bg-orange-900/20",
  },
  {
    label: "d20",
    sides: 20,
    colorClass:
      "!text-yellow-400 !border-yellow-500/50 !border-2 hover:!border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-yellow-900/20",
  },
];

const DiceRoller = () => {
  const [history, setHistory] = useState([]);
  const [rollingDice, setRollingDice] = useState(null); // label del dado que está rodando

  const rollDie = (sides, label) => {
    setRollingDice(label);
    
    // Pequeño delay para la animación de "shake"
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      const newRoll = {
        id: Date.now(),
        label,
        result,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setHistory((prev) => [newRoll, ...prev].slice(0, 10));
      setRollingDice(null);
    }, 400);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2 font-fantasy">
        <span>🎲</span> Torre de Dados
      </h2>

      {/* Grid de Botones */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {DICE_TYPES.map((die) => (
          <button
            key={die.label}
            onClick={() => rollDie(die.sides, die.label)}
            disabled={!!rollingDice}
            // Combinamos btn-arcane (fondo/forma) con los colores específicos
            className={`btn-arcane font-bold py-2 rounded-lg flex flex-col items-center justify-center h-16 w-full transition-all ${die.colorClass} ${rollingDice === die.label ? 'animate-dice-shake' : ''}`}
          >
            <span className="text-lg filter drop-shadow-md">{die.label}</span>
          </button>
        ))}
      </div>

      {/* Historial */}
      <div className="flex-grow bg-gray-900/40 rounded-lg p-3 overflow-y-auto custom-scrollbar border border-gray-800">
        <h3 className="text-[10px] text-gray-500 uppercase font-bold mb-2 sticky top-0 bg-gray-900/90 pb-1 backdrop-blur-sm">
          Historial
        </h3>
        <ul className="space-y-2">
          {history.map((roll) => (
            <li
              key={roll.id}
              className="flex justify-between items-center border-b border-gray-800 pb-1 last:border-0 animate-fade-in"
            >
              <span className="text-gray-500 text-xs font-mono">
                {roll.timestamp}
              </span>
              <span className="font-fantasy text-gray-300 text-sm">
                {roll.label}
              </span>
              <span
                className={`font-bold text-lg px-2 rounded-md transition-all ${
                  roll.result === 20 && roll.label === 'd20' 
                    ? "text-yellow-400 animate-crit-gold bg-yellow-900/20 border border-yellow-500/50" 
                    : roll.result === 1 && roll.label === 'd20'
                    ? "text-red-500 animate-crit-red bg-red-900/20 border border-red-500/50"
                    : "text-white"
                }`}
              >
                {roll.result}
              </span>
            </li>
          ))}
          {history.length === 0 && (
            <p className="text-gray-600 text-center text-xs italic mt-4">
              El destino espera...
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DiceRoller;
