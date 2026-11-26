import { useState, useEffect } from 'react';
import { ArrowLeft, Link2, Terminal, CheckCircle2 } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import { API_BASE_URL } from '../services/api';

export default function AuthView({
  initialMode = 'login',
  onBack,
  onAuthSuccess,
}) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setError('');
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser({ email, password });
      }
      const res = await loginUser({ email, password });
      if (res?.access_token) {
        onAuthSuccess(res.access_token, email);
      } else {
        setError('No se recibió el token de acceso.');
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Credenciales inválidas o error de conexión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-zinc-900 flex flex-col justify-between">
      {/* Barra superior minimalista */}
      <header className="border-b border-zinc-200/90 bg-[#F7F6F2]/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-base tracking-tight text-zinc-900">
            <Link2 className="w-4 h-4 text-blue-600 -rotate-45" />
            <span>fast-url</span>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
          )}
        </div>
      </header>

      {/* Contenedor dividido */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Izquierda: Formulario limpio */}
          <div className="lg:col-span-6 bg-white border border-zinc-200/90 rounded-xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                {isRegister ? '(01) REGISTRO' : '(01) ACCESO'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                {isRegister ? 'Crea tu cuenta.' : 'Inicia sesión.'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {isRegister
                  ? 'Regístrate para guardar enlaces ilimitados, generar códigos QR y consultar el conteo de clics.'
                  : 'Ingresa con tu correo para administrar tu historial de atajos.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-600 focus:bg-white rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                  CONTRASEÑA
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-600 focus:bg-white rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none transition"
                />
              </div>

              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs sm:text-sm font-medium py-2.5 rounded-lg transition cursor-pointer"
              >
                {loading
                  ? 'Procesando...'
                  : isRegister
                  ? 'Crear cuenta y entrar'
                  : 'Entrar al espacio de trabajo'}
              </button>
            </form>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                {isRegister ? 'Iniciar sesión →' : 'Crear cuenta →'}
              </button>
            </div>
          </div>

          {/* Derecha: Bloque técnico estilo consola */}
          <div className="lg:col-span-6 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-800 pb-3">
                <span className="inline-flex items-center gap-1.5 text-blue-400">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>SESIÓN JWT</span>
                </span>
                <span>{API_BASE_URL.replace(/^https?:\/\//, '')}</span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white pt-1">
                {isRegister
                  ? 'Sin límite de enlaces activos.'
                  : 'Tus atajos sincronizados.'}
              </h2>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Mientras el modo invitado permite probar la herramienta con 1 enlace, una cuenta registrada guarda tu historial completo en PostgreSQL.
              </p>
            </div>

            {/* Bloque JSON ilustrativo del flujo */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 space-y-1.5 overflow-x-auto">
              <p className="text-[10px] text-zinc-500 uppercase">
                RESPUESTA DE AUTENTICACIÓN
              </p>
              <pre className="leading-relaxed text-[11px] sm:text-xs">{`{
  "token_type": "bearer",
  "scope": "links:unlimited",
  "cache": "redis-enabled"
}`}</pre>
            </div>

            <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Generación y descarga de códigos QR en PNG</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Activación, pausa y eliminación de enlaces al instante</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200/90 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>fast-url</span>
          <span>FastAPI · React · PostgreSQL · Redis</span>
        </div>
      </footer>
    </div>
  );
}