import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const VIEWS = ["combat", "search", "tools"];

const Layout = ({ 
  children, 
  mobileView, 
  setMobileView, 
  activeTheme = "fortaleza", 
  onChangeTheme 
}) => {
  const { signOut, user } = useAuth();
  const touchStartX = useRef(null);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 50) return; // Ignorar swipes cortos
    const currentIdx = VIEWS.indexOf(mobileView);
    if (deltaX < 0 && currentIdx < VIEWS.length - 1) {
      setMobileView(VIEWS[currentIdx + 1]); // Swipe izquierda → siguiente
    } else if (deltaX > 0 && currentIdx > 0) {
      setMobileView(VIEWS[currentIdx - 1]); // Swipe derecha → anterior
    }
  };
  const childrenArray = React.Children.toArray(children);

  const colIzquierda = childrenArray[0];
  const colCentro = childrenArray[1];
  const colDerecha = childrenArray[2];
  const modales = childrenArray.slice(3);

  return (
    <div className="h-[100dvh] bg-dungeon-dark text-gray-200 selection:bg-dungeon-gold selection:text-black flex flex-col lg:block overflow-hidden relative">
      
      {/* --- BARRA SUPERIOR --- */}
      <header className="bg-dungeon-panel border-b-2 border-dungeon-gold/30 shadow-2xl z-40 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-2 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">🐲</span>
            <div>
              <h1 className="text-lg md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-dungeon-gold via-dungeon-accent to-dungeon-gold animate-pulse font-fantasy leading-none md:leading-normal">
                DM Command Center
              </h1>
              <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-sans">Gestión de Campaña</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-5 text-xs font-fantasy text-gray-500">
            {/* Selector de Temas Visuales */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-dungeon-dark hover:bg-dungeon-panel border border-dungeon-border hover:border-dungeon-gold/50 rounded-lg text-sm text-gray-300 hover:text-dungeon-gold transition-all shadow-md active:scale-95 cursor-pointer"
                title="Cambiar Tema Ambiental"
              >
                <span className="text-base">🎨</span>
              </button>

              {isThemeMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsThemeMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-dungeon-panel border-2 border-dungeon-border rounded-xl shadow-2xl z-50 py-1.5 animate-fade-in text-left">
                    <div className="px-3 py-1 border-b border-dungeon-border text-[9px] font-bold text-gray-500 uppercase tracking-widest font-sans">
                      Temas Ambientales
                    </div>
                    {[
                      { id: "fortaleza", label: "Fortaleza", icon: "🏰" },
                      { id: "bosque", label: "Bosque Feérico", icon: "🌿" },
                      { id: "infierno", label: "Infierno", icon: "🔥" },
                      { id: "tundra", label: "Tundra", icon: "❄️" },
                      { id: "piratas", label: "Piratas", icon: "🏴‍☠️" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onChangeTheme(t.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-fantasy transition-colors cursor-pointer ${
                          activeTheme === t.id
                            ? "bg-dungeon-gold/20 text-dungeon-gold font-bold"
                            : "text-gray-300 hover:bg-dungeon-dark hover:text-white"
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span className="hidden sm:inline text-[10px] text-gray-400 font-sans tracking-tight">{user?.email}</span>
              <button 
                onClick={() => signOut()} 
                className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-red-900/10 border border-red-900/50 rounded-md text-[9px] text-red-400 hover:text-white hover:bg-red-700/80 hover:border-red-500 transition-all uppercase font-black tracking-tighter shadow-inner cursor-pointer"
                title="Cerrar Sesión"
              >
                <span className="hidden sm:inline">Puerta de Salida</span>
                <span className="text-xs">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-2 md:p-6 lg:p-8 relative z-10 flex flex-col min-h-0 lg:h-[calc(100vh-80px)]">
        
        {/* GRID DE ESCRITORIO (Oculto en móvil) */}
        <div className="hidden lg:grid grid-cols-12 gap-6 h-full">
          <div className="col-span-5 h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-dungeon-border bg-dungeon-panel/80 backdrop-blur-sm">
            {colIzquierda}
          </div>
          <div className="col-span-4 h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-dungeon-border bg-dungeon-panel/80 backdrop-blur-sm">
            {colCentro}
          </div>
          <div className="col-span-3 h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-dungeon-border bg-dungeon-panel/80 backdrop-blur-sm">
            {colDerecha}
          </div>
        </div>

        {/* VISTAS DE MÓVIL (Ocultas en escritorio) */}
        <div 
          className="flex-1 flex flex-col lg:hidden pb-[70px] min-h-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        > 
          {mobileView === "combat" && (
            <div className="flex-1 overflow-hidden flex flex-col shadow-lg rounded-lg border border-dungeon-border bg-dungeon-panel/90 backdrop-blur-sm animate-fade-in">
              {colIzquierda}
            </div>
          )}
          {mobileView === "search" && (
            <div className="flex-1 overflow-hidden flex flex-col shadow-lg rounded-lg border border-dungeon-border bg-dungeon-panel/90 backdrop-blur-sm animate-fade-in">
              {colCentro}
            </div>
          )}
          {mobileView === "tools" && (
            <div className="flex-1 overflow-hidden flex flex-col shadow-lg rounded-lg border border-dungeon-border bg-dungeon-panel/90 backdrop-blur-sm animate-fade-in">
              {colDerecha}
            </div>
          )}
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION BAR (SÓLO MÓVIL) --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-[70px] bg-dungeon-dark border-t-2 border-dungeon-gold/20 z-40">
        <div className="flex justify-around items-center h-full px-2">
          <button onClick={() => setMobileView("combat")} className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${mobileView === "combat" ? "text-red-400" : "text-gray-500 hover:text-gray-300"}`}>
            <span className="text-xl mb-1">⚔️</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Combate</span>
          </button>
          <button onClick={() => setMobileView("search")} className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${mobileView === "search" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}>
            <span className="text-xl mb-1">🐉</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Librería</span>
          </button>
          <button onClick={() => setMobileView("tools")} className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${mobileView === "tools" ? "text-yellow-500" : "text-gray-500 hover:text-gray-300"}`}>
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