import { ArrowRight, ArrowUpRight, Compass } from 'lucide-react';
import SignalWavesBg from './SignalWavesBg';

export default function WelcomeView({ onGetStarted, onGoToLogin, onContinueAsGuest }) {
  return (
    <div className="min-h-screen bg-[#F4F2EC] text-[#141413] flex flex-col justify-between relative overflow-hidden selection:bg-[#E5391B] selection:text-white">
      <SignalWavesBg />

      <header className="relative z-10 border-b border-[#141413]/15 bg-[#FAF9F6]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#E5391B] text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </span>
            <span className="font-mono font-bold text-sm tracking-tight text-[#141413]">
              fast-url
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-xs sm:text-sm font-medium text-[#141413] hover:text-[#E5391B] px-3 py-1.5 transition cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="text-xs sm:text-sm font-semibold bg-[#141413] hover:bg-[#E5391B] text-[#FAF9F6] px-4 py-2 rounded-full transition cursor-pointer"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF9F6] border border-[#141413]/20 text-xs font-medium text-[#0F766E]">
            <span className="w-2 h-2 rounded-full bg-[#E5391B]" />
            <span>Gestión de enlaces cortos, QR y registro de visitas</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#141413] leading-[1.04]">
            Enlaces limpios que llevan directo al destino.
          </h1>

          <p className="text-base text-[#4A4945] max-w-xl leading-relaxed">
            Crea rutas cortas con alias propios, programa expiraciones, descarga códigos QR y
            revisa el historial de cada clic desde tu navegador o red local.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onGetStarted}
              className="bg-[#E5391B] hover:bg-[#C82E13] text-white font-semibold text-sm px-6 py-3.5 rounded-full transition cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              <span>Empezar ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onGoToLogin}
              className="bg-[#FAF9F6] hover:bg-white text-[#141413] font-semibold text-sm px-6 py-3.5 rounded-full border border-[#141413]/25 transition cursor-pointer"
            >
              Ya tengo cuenta
            </button>

            <button
              type="button"
              onClick={onContinueAsGuest}
              className="bg-[#0F766E] hover:bg-[#0B5B55] text-white font-semibold text-sm px-5 py-3.5 rounded-full transition cursor-pointer"
            >
              Usar sin cuenta (1 enlace)
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-[#FAF9F6]/95 backdrop-blur-sm border border-[#141413]/20 rounded-3xl p-6 space-y-5 shadow-[8px_8px_0px_#141413]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6E6C65]">
                Ruta de ejemplo
              </span>
              <span className="text-xs font-mono font-semibold text-[#0F766E] bg-[#0F766E]/10 px-2.5 py-1 rounded-full">
                Activa · 307
              </span>
            </div>

            <div className="bg-[#F4F2EC] border border-[#141413]/15 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-[#6E6C65] block">Enlace corto</span>
              <div className="flex items-center justify-between gap-2 font-mono text-sm font-bold text-[#E5391B]">
                <span className="truncate">/lanza-26</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </div>
            </div>

            <div className="bg-[#F4F2EC] border border-[#141413]/15 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-[#6E6C65] block">Destino configurado</span>
              <p className="font-mono text-xs text-[#141413] truncate">
                https://ejemplo.com/campanas/lanzamiento-producto
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#F4F2EC] rounded-xl p-2.5 border border-[#141413]/10">
                <span className="block font-mono text-sm font-bold text-[#141413]">Slug</span>
                <span className="text-[11px] text-[#6E6C65]">A medida</span>
              </div>
              <div className="bg-[#F4F2EC] rounded-xl p-2.5 border border-[#141413]/10">
                <span className="block font-mono text-sm font-bold text-[#141413]">QR</span>
                <span className="text-[11px] text-[#6E6C65]">Listo</span>
              </div>
              <div className="bg-[#F4F2EC] rounded-xl p-2.5 border border-[#141413]/10">
                <span className="block font-mono text-sm font-bold text-[#0F766E]">42</span>
                <span className="text-[11px] text-[#6E6C65]">Clics</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#141413]/15 py-4 px-5 sm:px-8 bg-[#FAF9F6]/70">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-[#6E6C65]">
          <span>fast-url</span>
          <span>Rutas cortas y estadísticas</span>
        </div>
      </footer>
    </div>
  );
}