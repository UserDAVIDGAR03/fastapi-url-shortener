import { useState } from 'react';
import { ArrowLeft, Compass, AlertCircle } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import SignalWavesBg from './SignalWavesBg';

export default function AuthView({ initialMode = 'login', onAuthenticated, onBackToWelcome }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Completa tu correo y contraseña.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const data =
        mode === 'login'
          ? await loginUser({ email: email.trim(), password })
          : await registerUser({ email: email.trim(), password });

      localStorage.setItem('fast_url_token', data.access_token);
      localStorage.setItem('fast_url_email', data.email);
      onAuthenticated({ token: data.access_token, email: data.email });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('No se pudo completar la autenticación. Verifica tus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2EC] text-[#141413] flex flex-col justify-between relative overflow-hidden selection:bg-[#E5391B] selection:text-white">
      <SignalWavesBg />

      <header className="relative z-10 border-b border-[#141413]/15 bg-[#FAF9F6]/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToWelcome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#141413] hover:text-[#E5391B] bg-[#F4F2EC] hover:bg-white border border-[#141413]/20 px-4 py-2 rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Regresar al welcome</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#E5391B] text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </span>
            <span className="font-mono font-bold text-sm">fast-url</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md bg-[#FAF9F6]/95 backdrop-blur-sm border border-[#141413]/20 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#141413] space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-semibold text-[#0F766E] block">
                {mode === 'login' ? 'Acceso a tu cuenta' : 'Registro rápido'}
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#141413] mt-0.5">
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h1>
            </div>

            <div className="inline-flex bg-[#F4F2EC] border border-[#141413]/15 rounded-full p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#141413] text-[#FAF9F6]'
                    : 'text-[#5A5852] hover:text-[#141413]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#141413] text-[#FAF9F6]'
                    : 'text-[#5A5852] hover:text-[#141413]'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-[#F4F2EC] border border-[#141413]/20 focus:border-[#E5391B] rounded-xl px-4 py-2.5 text-sm text-[#141413] placeholder-[#8A877E] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#F4F2EC] border border-[#141413]/20 focus:border-[#E5391B] rounded-xl px-4 py-2.5 text-sm text-[#141413] placeholder-[#8A877E] outline-none transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-[#E5391B]/10 border border-[#E5391B]/40 rounded-xl flex items-center gap-2 text-[#B91C1C] text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E5391B] hover:bg-[#C82E13] disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-full transition cursor-pointer"
            >
              {loading
                ? 'Cargando...'
                : mode === 'login'
                  ? 'Entrar al panel'
                  : 'Registrarme'}
            </button>
          </form>

          <div className="pt-3 border-t border-[#141413]/15 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onBackToWelcome}
              className="font-semibold text-[#4A4945] hover:text-[#141413] inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al welcome</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="font-semibold text-[#0F766E] hover:underline cursor-pointer"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#141413]/15 py-3.5 px-5 sm:px-8 bg-[#FAF9F6]/70">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs font-mono text-[#6E6C65]">
          <span>fast-url</span>
          <span>Autenticación JWT</span>
        </div>
      </footer>
    </div>
  );
}