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
  const [rollingDice, setRollingDice] = useState(null); // label del dado o "formula"
  const [rollMode, setRollMode] = useState("normal"); // "normal", "advantage", "disadvantage"
  const [customFormula, setCustomFormula] = useState("");

  const parseRollFormula = (formulaStr, globalMode) => {
    let formula = formulaStr.toLowerCase().replace(/\s+/g, '');
    
    // Detectar ventaja/desventaja escrita
    let mode = globalMode;
    if (formula.includes('conventaja') || formula.includes('ventaja') || formula.includes('adv')) {
      mode = 'advantage';
      formula = formula.replace(/conventaja|ventaja|adv/g, '');
    } else if (formula.includes('condesventaja') || formula.includes('desventaja') || formula.includes('dis')) {
      mode = 'disadvantage';
      formula = formula.replace(/condesventaja|desventaja|dis/g, '');
    }

    const tokenRegex = /([+-]?)(?:(\d*)d(\d+)|(\d+))/g;
    let match;
    
    let total = 0;
    let breakdownParts = [];
    let containsD20 = false;
    let hasTokens = false;

    // Si la fórmula está vacía
    if (!formula) return null;

    while ((match = tokenRegex.exec(formula)) !== null) {
      hasTokens = true;
      const signStr = match[1] || '+';
      const sign = signStr === '-' ? -1 : 1;
      
      if (match[2] !== undefined || match[3] !== undefined) {
        // Término de dados: AdB (e.g. 2d6)
        const count = parseInt(match[2] || '1', 10);
        const sides = parseInt(match[3], 10);
        const rolls = [];

        if (sides === 20) {
          containsD20 = true;
        }

        for (let i = 0; i < count; i++) {
          rolls.push(Math.floor(Math.random() * sides) + 1);
        }

        let chosenRolls = [...rolls];
        let rollBreakdown = '';

        // Ventaja/desventaja en d20
        if (sides === 20 && count === 1 && (mode === 'advantage' || mode === 'disadvantage')) {
          const secondRoll = Math.floor(Math.random() * 20) + 1;
          const highest = Math.max(rolls[0], secondRoll);
          const lowest = Math.min(rolls[0], secondRoll);
          const finalRoll = mode === 'advantage' ? highest : lowest;
          
          chosenRolls = [finalRoll];
          rollBreakdown = `d20(${rolls[0]}, ${secondRoll}) → [${finalRoll}]`;
        } else {
          rollBreakdown = `${count}d${sides}(${rolls.join(', ')})`;
        }

        const sumRolls = chosenRolls.reduce((a, b) => a + b, 0);
        total += sign * sumRolls;
        
        breakdownParts.push(`${signStr === '-' ? '-' : ''}${rollBreakdown}`);
      } else if (match[4] !== undefined) {
        // Constante
        const value = parseInt(match[4], 10);
        total += sign * value;
        breakdownParts.push(`${signStr === '-' ? '-' : '+'}${value}`);
      }
    }

    if (!hasTokens || breakdownParts.length === 0) return null;

    let breakdownText = breakdownParts.join(' ');
    if (breakdownText.startsWith('+')) {
      breakdownText = breakdownText.substring(1);
    }

    let modeLabel = '';
    if (mode === 'advantage' && containsD20) modeLabel = ' (con Ventaja)';
    if (mode === 'disadvantage' && containsD20) modeLabel = ' (con Desventaja)';

    return {
      formula: formulaStr + modeLabel,
      result: total,
      breakdown: `${breakdownText} = ${total}`
    };
  };

  const handleRoll = (formulaText, clickLabel) => {
    setRollingDice(clickLabel);
    
    setTimeout(() => {
      const rollData = parseRollFormula(formulaText, rollMode);
      if (rollData) {
        const newRoll = {
          id: Date.now(),
          label: rollData.formula,
          result: rollData.result,
          breakdown: rollData.breakdown,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        };
        setHistory((prev) => [newRoll, ...prev].slice(0, 15));
      } else {
        alert("Fórmula de dados inválida. Usa el formato: 2d6+4, 1d20+5, etc.");
      }
      setRollingDice(null);
    }, 400);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!customFormula.trim()) return;
    handleRoll(customFormula, "formula");
    setCustomFormula("");
  };

  return (
    <div className="h-full flex flex-col p-4 bg-transparent">
      <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2 font-fantasy">
        <span>🎲</span> Torre de Dados
      </h2>

      {/* Grid de Botones Rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {DICE_TYPES.map((die) => (
          <button
            key={die.label}
            onClick={() => handleRoll(`1${die.label}`, die.label)}
            disabled={!!rollingDice}
            className={`btn-arcane font-bold py-2 rounded-lg flex flex-col items-center justify-center h-14 w-full transition-all ${die.colorClass} ${rollingDice === die.label ? 'animate-dice-shake' : ''}`}
          >
            <span className="text-lg filter drop-shadow-md">{die.label}</span>
          </button>
        ))}
      </div>

      {/* Modo de Tirada (Normal / Ventaja / Desventaja) */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setRollMode("normal")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-all ${
            rollMode === "normal"
              ? "bg-gray-700 border-gray-500 text-white"
              : "bg-gray-900/50 border-gray-800 text-gray-500 hover:text-gray-300"
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setRollMode("advantage")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-all ${
            rollMode === "advantage"
              ? "bg-green-950/80 border-green-600 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
              : "bg-gray-900/50 border-gray-800 text-gray-500 hover:text-green-500/80"
          }`}
        >
          Ventaja (ADV)
        </button>
        <button
          onClick={() => setRollMode("disadvantage")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-all ${
            rollMode === "disadvantage"
              ? "bg-red-950/80 border-red-600 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              : "bg-gray-900/50 border-gray-800 text-gray-500 hover:text-red-500/80"
          }`}
        >
          Desventaja (DIS)
        </button>
      </div>

      {/* Formulario de Fórmulas Complejas */}
      <form onSubmit={handleFormSubmit} className="flex gap-2 mb-4 shrink-0">
        <input
          type="text"
          value={customFormula}
          onChange={(e) => setCustomFormula(e.target.value)}
          placeholder="Fórmula (ej: 2d6+4, d20-1...)"
          className={`flex-grow bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-bold transition-all ${rollingDice === 'formula' ? 'animate-dice-shake' : ''}`}
        />
        <button
          type="submit"
          disabled={!!rollingDice || !customFormula.trim()}
          className={`px-4 rounded-lg font-black text-xs uppercase tracking-wider text-purple-200 border border-purple-800 transition-all ${
            rollingDice || !customFormula.trim()
              ? 'opacity-40 cursor-not-allowed'
              : 'bg-purple-950/40 hover:bg-purple-850 hover:border-purple-500 active:scale-95'
          }`}
        >
          Tirar
        </button>
      </form>

      {/* Historial */}
      <div className="flex-grow bg-gray-900/40 rounded-lg p-3 overflow-y-auto custom-scrollbar border border-gray-800">
        <h3 className="text-[10px] text-gray-500 uppercase font-bold mb-2 sticky top-0 bg-gray-900/90 pb-1 backdrop-blur-sm">
          Historial de Tiradas
        </h3>
        <ul className="space-y-2.5">
          {history.map((roll) => (
            <li
              key={roll.id}
              className="border-b border-gray-800/80 pb-2 last:border-0 last:pb-0 animate-fade-in flex flex-col gap-0.5"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-gray-600 text-[9px] font-mono">
                  {roll.timestamp}
                </span>
                <span className="font-fantasy text-gray-300 text-xs font-bold truncate max-w-[150px] capitalize">
                  {roll.label}
                </span>
                <span
                  className={`font-bold text-base px-2 rounded-md transition-all ${
                    roll.result === 20 && roll.label.toLowerCase().includes('d20')
                      ? "text-yellow-400 animate-crit-gold bg-yellow-900/20 border border-yellow-500/50" 
                      : roll.result === 1 && roll.label.toLowerCase().includes('d20')
                      ? "text-red-500 animate-crit-red bg-red-900/20 border border-red-500/50"
                      : "text-white"
                  }`}
                >
                  {roll.result}
                </span>
              </div>
              {roll.breakdown && (
                <span className="text-[10px] text-gray-500 font-mono italic text-left pl-1">
                  🎲 {roll.breakdown}
                </span>
              )}
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
