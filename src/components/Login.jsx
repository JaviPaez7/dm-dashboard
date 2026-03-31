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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-red-600 tracking-wider mb-2" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            ⚔️ DM Command Center
          </h1>
          <p className="text-gray-400">Identifícate para entrar al panel</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1 uppercase font-bold" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-3 focus:outline-none focus:border-yellow-500"
              placeholder="dm@dungeons.com"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1 uppercase font-bold" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-3 focus:outline-none focus:border-yellow-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded font-bold text-white shadow-lg mt-4 transition-colors ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600'}`}
          >
            {loading ? 'Cargando...' : (isRegistering ? 'Crear Cuenta' : 'Entrar al Panel')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿Nuevo por aquí? Crea una cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
