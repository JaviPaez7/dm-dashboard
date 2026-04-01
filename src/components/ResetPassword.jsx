import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword, setRecoveryMode } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setRecoveryMode(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.1)_0%,transparent_70%)] pointer-events-none"></div>
      
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-[#121212] p-8 md:p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 border-yellow-900/30 relative">
          <div className="text-center mb-10 relative">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-500 to-yellow-800 tracking-[0.1em] uppercase mb-2" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              Restaurar Sello
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-800 to-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Establece tu nueva credencial</p>
          </div>

          {error && (
            <div className="bg-red-950/40 border-l-4 border-red-600 p-4 rounded mb-6 text-xs font-bold text-red-200 animate-shake flex items-center gap-3">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-950/40 border-l-4 border-green-600 p-4 rounded mb-6 text-xs font-bold text-green-200 flex items-center gap-3">
              <span>✨</span> ¡Sello restaurado! Redirgiendo al gremio...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="group">
                <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2 group-focus-within:text-yellow-600" htmlFor="password">
                  Nuevo Sello Sagrado
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">🔑</span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border-b-2 border-gray-800 text-white rounded-t-lg pl-12 pr-4 py-4 focus:outline-none focus:border-yellow-700 transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2 group-focus-within:text-yellow-600" htmlFor="confirm">
                  Confirmar Sello
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">🛡️</span>
                  <input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border-b-2 border-gray-800 text-white rounded-t-lg pl-12 pr-4 py-4 focus:outline-none focus:border-yellow-700 transition-all text-sm"
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
                    : 'bg-gradient-to-r from-yellow-900 to-yellow-700 text-white hover:from-yellow-800 hover:to-yellow-600'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? <span className="animate-spin">⏳</span> : <span>Forjar Nuevo Sello</span>}
                </div>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
