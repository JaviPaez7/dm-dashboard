import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await signUp({ email, password });
        if (error) throw error;
        setError('¡Registro exitoso! Por favor inicia sesión ahora.');
        setIsRegistering(false);
      } else {
        const { error } = await signIn({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fondo de ambiente */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.15)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none"></div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Adorno superior (Dungeons Style) */}
        <div className="flex justify-center mb-[-20px] relative z-10">
          <div className="bg-[#1a1a1a] border-2 border-yellow-700 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(184,134,11,0.4)]">
             <span className="text-3xl">🐲</span>
          </div>
        </div>

        <div className="bg-[#121212] p-8 md:p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 border-gray-800 relative">
          {/* Borde interior dorado sutil */}
          <div className="absolute inset-1 border border-yellow-900/20 rounded-xl pointer-events-none"></div>
          <div className="text-center mb-10 relative">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 tracking-[0.1em] uppercase mb-2 drop-shadow-2xl" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              DM Center
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-red-800 to-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">Inicia tu Campaña</p>
          </div>

        {error && (
          <div className="bg-red-950/40 border-l-4 border-red-600 text-red-200 p-4 rounded mb-6 text-xs font-bold flex items-center gap-3 animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">
            <div className="group">
              <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2 group-focus-within:text-yellow-600 transition-colors" htmlFor="email">
                Pergamino de Identidad (Email)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">📧</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border-b-2 border-gray-800 text-white rounded-t-lg pl-12 pr-4 py-4 focus:outline-none focus:border-red-700 focus:bg-red-900/5 transition-all text-sm"
                  placeholder="tu@reino.com"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2 group-focus-within:text-yellow-600 transition-colors" htmlFor="password">
                Sello Sagrado (Contraseña)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">🔑</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border-b-2 border-gray-800 text-white rounded-t-lg pl-12 pr-4 py-4 focus:outline-none focus:border-red-700 focus:bg-red-900/5 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`relative overflow-hidden group w-full py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-2xl mt-4 transition-all active:scale-95 ${
                loading 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-900 to-red-700 text-white hover:from-red-800 hover:to-red-600'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : (
                  <>
                    <span>{isRegistering ? 'Forjar Cuenta' : 'Entrar al Reino'}</span>
                    <span className="group-hover:translate-x-1 transition-transform">➡</span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-800/50 pt-6">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-gray-500 hover:text-yellow-600 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-110"
            >
              {isRegistering
                ? '¿Ya posees linaje? Inicia sesión'
                : '¿Eres nuevo en estas tierras? Regístrate'}
            </button>
          </div>
        </div>

        {/* Footer sutil */}
        <p className="text-center text-[9px] text-gray-700 mt-8 uppercase tracking-[0.5em] font-bold">
          © 2026 DM Command Center • Versión Legendaria
        </p>
      </div>
    </div>
  );
};

export default Login;
