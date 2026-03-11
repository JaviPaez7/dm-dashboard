import React from "react";

const Layout = ({ children }) => {
  // Convertimos los hijos en un array seguro para contarlos
  const childrenArray = React.Children.toArray(children);

  // Los 3 primeros son nuestras columnas principales
  const colIzquierda = childrenArray[0];
  const colCentro = childrenArray[1];
  const colDerecha = childrenArray[2];

  // Todo lo que venga después (del 3 en adelante) son MODALES
  const modales = childrenArray.slice(3);

  return (
    <div className="min-h-screen text-gray-200 selection:bg-yellow-500 selection:text-black">
      {/* --- BARRA SUPERIOR --- */}
      <header className="bg-[#161b22] border-b-2 border-yellow-700/50 shadow-2xl sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">
              🐲
            </span>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-200 to-yellow-600 animate-pulse font-fantasy">
                DM Command Center
              </h1>
              <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-sans">
                Gestión de Campaña
              </p>
            </div>
          </div>

          <div className="hidden md:flex gap-4 text-xs font-fantasy text-gray-500">
            <span>Pal Medina</span>
            <span className="text-yellow-600">•</span>
            <span></span>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-140px)] pb-20 lg:pb-0">
          {/* Columna 1: Combate */}
          <div className="lg:col-span-5 h-[600px] lg:h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-gray-800 bg-[#161b22]/80 backdrop-blur-sm">
            {colIzquierda}
          </div>

          {/* Columna 2: Buscadores (Bestiario/Grimorio) */}
          <div className="lg:col-span-4 h-[500px] lg:h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-gray-800 bg-[#161b22]/80 backdrop-blur-sm">
            {colCentro}
          </div>

          {/* Columna 3: Herramientas (Dados/Sonidos/Notas) */}
          <div className="lg:col-span-3 h-[500px] lg:h-full overflow-hidden flex flex-col shadow-2xl rounded-xl border border-gray-800 bg-[#161b22]/80 backdrop-blur-sm">
            {colDerecha}
          </div>
        </div>
      </main>

      {/* --- LOS MODALES --- 
          Se dibujan aquí, fuera del contenedor grid y fuera del overflow-hidden, 
          para garantizar que floten por encima de todo. 
      */}
      {modales}
    </div>
  );
};

export default Layout;
