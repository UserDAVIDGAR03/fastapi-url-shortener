import { Link2, LogOut } from 'lucide-react';

export default function Navbar({ userEmail, onLogout }) {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center">
            <Link2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-stone-900">
            fast-url
          </span>
        </div>

        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden sm:inline-block text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
              {userEmail}
            </span>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 px-3.5 py-2 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}