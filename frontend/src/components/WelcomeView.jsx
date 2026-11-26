import { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  BarChart2,
  Terminal,
  ArrowRight,
} from 'lucide-react';
import { API_BASE_URL, shortenUrl } from '../services/api';

const SAMPLE_LONG_URL =
  'https://www.tiendaejemplo.com/calzado/tenis-running/air-zoom-pegasus-41?color=negro&talla=27&utm_source=newsletter&utm_medium=email&utm_campaign=cyber-monday-2026';

export default function WelcomeView({
  onStartGuest,
  onGoLogin,
  onGoRegister,
}) {
  const [inputUrl, setInputUrl] = useState(SAMPLE_LONG_URL);
  const [shortResult, setShortResult] = useState(null);
  const [loadingShorten, setLoadingShorten] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [codeTab, setCodeTab] = useState('CURL');
  const [quickEmail, setQuickEmail] = useState('');

  const trimmedInput = inputUrl.trim();
  const originalLen = trimmedInput.length;
  const generatedShortUrl = shortResult
    ? `${API_BASE_URL}/${shortResult.short_id}`
    : `${API_BASE_URL}/k7Qp2`;
  const shortLen = generatedShortUrl.length;
  const savedPercent =
    originalLen > 0
      ? Math.max(0, Math.round(((originalLen - shortLen) / originalLen) * 100))
      : 0;

  const handleTryShorten = async (e) => {
    e.preventDefault();
    if (!trimmedInput || loadingShorten) return;
    setErrorMsg('');
    setLoadingShorten(true);
    try {
      const created = await shortenUrl({ original_url: trimmedInput });
      setShortResult(created);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setErrorMsg(
        typeof detail === 'string'
          ? detail
          : 'No se pudo probar el acortamiento ahora. Puedes entrar como invitado o iniciar sesión.'
      );
    } finally {
      setLoadingShorten(false);
    }
  };

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(generatedShortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setErrorMsg('No se pudo copiar al portapapeles.');
    }
  };

  const codeSnippets = {
    CURL: `curl -X POST "${API_BASE_URL}/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{
    "original_url": "${trimmedInput || SAMPLE_LONG_URL}"
  }'`,
    'Node.js': `const res = await fetch("${API_BASE_URL}/shorten", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    original_url: "${trimmedInput || SAMPLE_LONG_URL}"
  })
});
const data = await res.json();
console.log(data);`,
    Python: `import httpx

response = httpx.post(
    "${API_BASE_URL}/shorten",
    json={"original_url": "${trimmedInput || SAMPLE_LONG_URL}"}
)
print(response.status_code, response.json())`,
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-zinc-900 flex flex-col">
      {/* Barra superior */}
      <header className="border-b border-zinc-200/90 bg-[#F7F6F2]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-base tracking-tight text-zinc-900">
            <Link2 className="w-4 h-4 text-blue-600 -rotate-45" />
            <span>fast-url</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStartGuest}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Modo invitado
            </button>
            <button
              type="button"
              onClick={onGoLogin}
              className="text-xs font-medium text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={onGoRegister}
              className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-16">
        {/* Hero / Bloque principal de acortamiento en 2 columnas */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-5 space-y-4 pt-1">
            <span className="inline-block font-mono text-[11px] uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded">
              FastAPI · Redis · PostgreSQL
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.08]">
              Links largos,
              <br />
              atajos cortos.
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-md">
              Acorta URLs largas, genera códigos QR y consulta el conteo de clics con caché en Redis y persistencia en PostgreSQL.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onGoRegister}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
              >
                <span>Crear cuenta</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onStartGuest}
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
              >
                <span>Probar como invitado</span>
              </button>
            </div>
          </div>

          {/* Tarjeta interactiva: URL Original -> Atajo */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <form onSubmit={handleTryShorten} className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <label htmlFor="preview-url-input" className="font-semibold text-zinc-700">
                  URL ORIGINAL
                </label>
                <span>{originalLen} CARACTERES</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="preview-url-input"
                  type="url"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://ejemplo.com/ruta-muy-larga"
                  className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-blue-600 focus:bg-white rounded-lg px-3.5 py-2.5 font-mono text-xs text-zinc-800 focus:outline-none transition"
                />

                <button
                  type="submit"
                  disabled={loadingShorten || !trimmedInput}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  {loadingShorten ? 'Acortando...' : 'Acortar'}
                </button>
              </div>
            </form>

            {errorMsg && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <div className="pt-4 border-t border-zinc-100 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">ATAJO</span>
                <span>{shortLen} CARACTERES</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-zinc-50 border border-zinc-200/80 rounded-lg px-3.5 py-2.5">
                <a
                  href={generatedShortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs sm:text-sm font-semibold text-blue-600 hover:underline truncate"
                >
                  {generatedShortUrl}
                </a>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyPreview}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar enlace</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onStartGuest}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 px-2.5 py-1.5 rounded-md hover:bg-zinc-100 transition cursor-pointer"
                    title="Abrir espacio de trabajo"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <BarChart2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comparativa compacta de ahorro */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="bg-zinc-50 border border-zinc-200/70 rounded-lg py-2">
                  <p className="text-sm font-bold text-zinc-900">{originalLen}</p>
                  <p className="text-[10px] text-zinc-500">Original</p>
                </div>
                <div className="bg-zinc-50 border border-zinc-200/70 rounded-lg py-2">
                  <p className="text-sm font-bold text-blue-600">{shortLen}</p>
                  <p className="text-[10px] text-zinc-500">Atajo</p>
                </div>
                <div className="bg-zinc-50 border border-zinc-200/70 rounded-lg py-2">
                  <p className="text-sm font-bold text-emerald-700">{savedPercent}%</p>
                  <p className="text-[10px] text-zinc-500">Menos caracteres</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* (01) FLUJO en 3 pasos */}
        <section className="space-y-5 pt-4 border-t border-zinc-200/90">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="font-mono text-xs text-blue-600 font-semibold">
                (01) FLUJO
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Del enlace largo a la redirección, en tres pasos.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-200/90 rounded-xl p-5 space-y-2">
              <span className="font-mono text-xs font-bold text-blue-600">01</span>
              <h3 className="text-sm font-semibold text-zinc-900">
                Envías la URL larga
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Pegas el destino en el formulario o llamas al endpoint REST y se valida el formato de la URL.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-xl p-5 space-y-2">
              <span className="font-mono text-xs font-bold text-blue-600">02</span>
              <h3 className="text-sm font-semibold text-zinc-900">
                Recibes el atajo y su QR
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Se genera el identificador corto en PostgreSQL, se guarda en caché y queda listo para copiar o escanear.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-xl p-5 space-y-2">
              <span className="font-mono text-xs font-bold text-blue-600">03</span>
              <h3 className="text-sm font-semibold text-zinc-900">
                Redirige y suma clics
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Cada visita consulta primero Redis para responder rápido y registra el clic en tu historial.
              </p>
            </div>
          </div>
        </section>

        {/* (02) EJEMPLO de consumo API */}
        <section className="space-y-5 pt-4 border-t border-zinc-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-blue-600 font-semibold">
                (02) EJEMPLO
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Una petición, un atajo.
              </h2>
            </div>

            <div className="inline-flex bg-white border border-zinc-200 rounded-lg p-1 self-start">
              {Object.keys(codeSnippets).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCodeTab(tab)}
                  className={`px-3 py-1 rounded-md font-mono text-xs transition cursor-pointer ${
                    codeTab === tab
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>{codeTab}</span>
              </span>
              <span>{API_BASE_URL}</span>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-zinc-200">
              <code>{codeSnippets[codeTab]}</code>
            </pre>
          </div>
        </section>

        {/* Cierre directo */}
        <section className="bg-white border border-zinc-200/90 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Tu primer atajo está listo.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Crea una cuenta para guardar enlaces sin límite o entra directo como invitado.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onGoRegister();
            }}
            className="flex flex-col sm:flex-row gap-2 w-full md:w-auto"
          >
            <input
              type="email"
              value={quickEmail}
              onChange={(e) => setQuickEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer shrink-0"
            >
              Crear cuenta
            </button>
          </form>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="border-t border-zinc-200/90 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <span className="font-mono font-semibold text-zinc-800">fast-url</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onStartGuest}
              className="hover:text-zinc-900 cursor-pointer"
            >
              Espacio de trabajo
            </button>
            <button
              type="button"
              onClick={onGoLogin}
              className="hover:text-zinc-900 cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={onGoRegister}
              className="hover:text-zinc-900 cursor-pointer"
            >
              Registro
            </button>
          </div>
          <span className="font-mono text-[11px]">2026 fast-url</span>
        </div>
      </footer>
    </div>
  );
}