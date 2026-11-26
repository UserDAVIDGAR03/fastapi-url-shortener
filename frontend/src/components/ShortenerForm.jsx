import { useState } from 'react';
import { Globe, SlidersHorizontal, ArrowRight, AlertCircle } from 'lucide-react';
import { shortenUrl } from '../services/api';

export default function ShortenerForm({ onUrlCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresHours, setExpiresHours] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!originalUrl.trim()) {
      setError('Escribe o pega una URL válida para acortar.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        original_url: originalUrl.trim(),
      };

      if (customAlias.trim()) {
        payload.custom_alias = customAlias.trim();
      }

      if (expiresHours !== '' && Number(expiresHours) > 0) {
        payload.expires_in_hours = Number(expiresHours);
      }

      const created = await shortenUrl(payload);
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresHours('');
      onUrlCreated?.(created);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0]?.msg || 'Revisa los datos ingresados.');
      } else {
        setError('No se pudo acortar la URL. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1 flex items-center bg-[#F7F5EF] border border-stone-200 focus-within:border-[#1E3A5F] focus-within:bg-white rounded-xl px-3.5 transition">
          <Globe className="w-4 h-4 text-stone-400 shrink-0 mr-2.5" />
          <input
            type="url"
            required
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://ejemplo.com/ruta-larga"
            className="w-full py-3 bg-transparent text-sm text-stone-900 placeholder-stone-400 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowOptions((prev) => !prev)}
          className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            showOptions
              ? 'bg-[#1E3A5F]/10 border-[#1E3A5F]/40 text-[#1E3A5F]'
              : 'bg-[#F7F5EF] hover:bg-stone-100 border-stone-200 text-stone-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Opciones</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#1E3A5F] hover:bg-[#162B47] disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>{loading ? 'Acortando...' : 'Acortar'}</span>
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>

      {showOptions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#F7F5EF] border border-stone-200/90 rounded-xl p-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Alias personalizado (opcional)
            </label>
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="ej. mi-enlace-corto"
              className="w-full bg-white border border-stone-200 focus:border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-stone-900 placeholder-stone-400 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Expiración en horas (opcional)
            </label>
            <input
              type="number"
              min="1"
              max="8760"
              value={expiresHours}
              onChange={(e) => setExpiresHours(e.target.value)}
              placeholder="ej. 24"
              className="w-full bg-white border border-stone-200 focus:border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-stone-900 placeholder-stone-400 outline-none transition"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}