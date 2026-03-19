import React from "react";

const Layout = ({ children, mobileView, setMobileView }) => {
  const childrenArray = React.Children.toArray(children);

  const colIzquierda = childrenArray[0];
  const colCentro = childrenArray[1];
  const colDerecha = childrenArray[2];
  const modales = childrenArray.slice(3);

  return (
    // CAMBIO CLAVE: h-[100dvh] bloquea la altura al tamaño exacto de la pantalla del móvil.
    <div className="h-[100dvh] bg-[var(--color-dungeon-dark)] text-gray-200 selection:bg-yellow-500 selection:text-black flex flex-col lg:block overflow-hidden relative">
      
      {/* --- BARRA SUPERIOR --- */}
      <header className="bg-[#161b22] border-b-2 border-yellow-700/50 shadow-2xl z-40 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-2 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">🐲</span>
            <div>
              <h1 className="text-lg md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-200 to-yellow-600 animate-pulse font-fantasy leading-none md:leading-normal">
                DM Command Center
              </h1>
              <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-sans">Gestión de Campaña</p>
            </div>
          </div>
          <div className="hidden md:flex gap-4 text-xs font-fantasy text-gray-500">
            <span>Pal Medina</span>
            <span className="text-yellow-600">•</span>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {/* CAMBIO CLAVE: flex-1 y flex flex-col para que los hijos hereden el límite de altura */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-2 md:p-6 lg:p-8 relative z-10 flex flex-col min-h-0 lg:h-[calc(100vh-80px)]">
        
        {/* GRID DE ESCRITORIO (Oculto en móvil) */}
        <div className="hidden lg:grid grid-cols-12 gap-6 h-full">
          <div className="col-span-5 h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-gray-800 bg-[#161b22]/80 backdrop-blur-sm">
            {colIzquierda}
          </div>
          <div className="col-span-4 h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-gray-800 bg-[#161b22]/80 backdrop-blur-sm">
            {colCentro}
          </div>
          <div className="col-span-3 h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-gray-800 bg-[#161b22]/80 backdrop-blur-sm">
            {colDerecha}
          </div>
        </div>

        {/* VISTAS DE MÓVIL (Ocultas en escritorio) */}
        {/* CAMBIO CLAVE: Añadimos pb-[70px] para dejar espacio exacto para el menú inferior */}
        <div className="flex-1 flex flex-col lg:hidden pb-[70px] min-h-0"> 
          {mobileView === "combat" && (
            <div className="flex-1 overflow-hidden flex flex-col shadow-lg rounded-lg border border-gray-800 bg-[#161b22]/90 backdrop-blur-sm animate-fade-in">
              {colIzquierda}
            </div>
          )}
          {mobileView === "search" && (
            <div className="flex-1 overflow-hidden flex flex-col shadow-lg rounded-lg border border-gray-800 bg-[#161b22]/90 backdrop-blur-sm animate-fade-in">
              {colCentro}
            </div>
          )}
          {mobileView === "tools" && (
            <div className="flex-1 overflow-hidden flex flex-col shadow-lg rounded-lg border border-gray-800 bg-[#161b22]/90 backdrop-blur-sm animate-fade-in">
              {colDerecha}
            </div>
          )}
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION BAR (SÓLO MÓVIL) --- */}
      <nav className="lg:hidden absolute bottom-0 w-full h-[70px] bg-gray-900 border-t-2 border-yellow-700/30 z-40">
        <div className="flex justify-around items-center h-full px-2">
          <button onClick={() => setMobileView("combat")} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mobileView === "combat" ? "text-red-400" : "text-gray-500 hover:text-gray-300"}`}>
            <span className="text-xl mb-1">⚔️</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Combate</span>
          </button>
          <button onClick={() => setMobileView("search")} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mobileView === "search" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}>
            <span className="text-xl mb-1">🐉</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Librería</span>
          </button>
          <button onClick={() => setMobileView("tools")} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mobileView === "tools" ? "text-yellow-500" : "text-gray-500 hover:text-gray-300"}`}>
            <span className="text-xl mb-1">🎲</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Herr.</span>
          </button>
        </div>
      </nav>

      {modales}
    </div>
  );
};

export default Layout;