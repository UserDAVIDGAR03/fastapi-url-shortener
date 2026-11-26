import { useState } from 'react';
import { Link2, LogOut, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function Navbar({
  activeTab,
  onChangeTab,
  isGuest,
  userEmail,
  guestUsedCount,
  onOpenAuth,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarLetter = (userEmail?.[0] || 'U').toUpperCase();
  const hostShort = API_BASE_URL.replace(/^https?:\/\//, '');

  return (
    <header className="sticky top-0 z-30 bg-[#F7F6F2]/95 backdrop-blur border-b border-zinc-200/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <button
            type="button"
            onClick={() => onChangeTab('home')}
            className="flex items-center gap-2 font-semibold text-base tracking-tight text-zinc-900 cursor-pointer"
          >
            <Link2 className="w-4 h-4 text-blue-600 -rotate-45" />
            <span>fast-url</span>
          </button>

          <nav className="flex items-center gap-5 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => onChangeTab('home')}
              className={`h-14 inline-flex items-center border-b-2 transition cursor-pointer ${
                activeTab === 'home'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Inicio
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('history')}
              className={`h-14 inline-flex items-center border-b-2 transition cursor-pointer ${
                activeTab === 'history'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Historial
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2.5 relative">
          <span className="hidden md:inline-block font-mono text-[11px] text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded">
            {hostShort}
          </span>

          {isGuest && (
            <span className="text-[11px] font-mono text-zinc-700 bg-white border border-zinc-200 px-2 py-0.5 rounded">
              INVITADO {Math.min(guestUsedCount, 1)}/1
            </span>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-zinc-200 bg-white pl-1 pr-2 py-1 hover:bg-zinc-50 transition"
            aria-label="Menú de cuenta"
          >
            <span className="w-6 h-6 rounded bg-zinc-900 text-white font-mono text-xs font-semibold flex items-center justify-center">
              {isGuest ? 'G' : avatarLetter}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {menuOpen && (
            <div
              onMouseLeave={() => setMenuOpen(false)}
              className="absolute right-0 top-11 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-40 text-xs"
            >
              <div className="px-3 py-2 border-b border-zinc-100">
                <p className="font-semibold text-zinc-900 truncate">
                  {isGuest ? 'Sesión de invitado' : userEmail}
                </p>
                <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                  {isGuest ? 'Límite: 1 enlace activo' : 'JWT · Enlaces ilimitados'}
                </p>
              </div>

              {isGuest ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left px-3 py-2 text-blue-600 font-semibold hover:bg-zinc-50 cursor-pointer"
                >
                  Iniciar sesión / Crear cuenta
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}