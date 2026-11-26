import { useState } from 'react';

export default function ShortenerForm({
  onShorten,
  submitting,
  disabled,
  guestLimitReached,
  onOpenAuth,
}) {
  const [url, setUrl] = useState('');
  const charCount = url.trim().length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || submitting || disabled) return;
    await onShorten(trimmed);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <label htmlFor="dashboard-url-input" className="font-semibold text-zinc-700">
          URL ORIGINAL
        </label>
        <span>{charCount} CARACTERES</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="dashboard-url-input"
          type="url"
          required
          autoFocus
          disabled={disabled || submitting}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={
            guestLimitReached
              ? 'Límite de invitado alcanzado (1/1). Inicia sesión para crear más...'
              : 'https://ejemplo.com/enlace-muy-largo'
          }
          className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-blue-600 focus:bg-white rounded-lg px-3.5 py-2.5 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed transition"
        />

        {guestLimitReached ? (
          <button
            type="button"
            onClick={onOpenAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition cursor-pointer shrink-0"
          >
            Iniciar sesión
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting || !charCount}
            className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {submitting ? 'Acortando...' : 'Acortar'}
          </button>
        )}
      </div>
    </form>
  );
}