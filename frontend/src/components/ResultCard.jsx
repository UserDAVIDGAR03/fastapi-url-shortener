import { Copy, Check, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function ResultCard({ urlData, copiedId, onCopy, onRefresh }) {
  if (!urlData) return null;

  const shortUrl = `${API_BASE_URL}/${urlData.short_id}`;
  const isCopied = copiedId === urlData.short_id;

  return (
    <div className="bg-[#F7F5EF] border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
          Enlace listo
        </span>
        <div className="flex items-center gap-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setTimeout(() => onRefresh?.(), 600)}
            className="font-mono text-sm font-semibold text-[#1E3A5F] hover:underline truncate"
          >
            {shortUrl}
          </a>
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setTimeout(() => onRefresh?.(), 600)}
            className="text-stone-400 hover:text-stone-700 shrink-0"
            title="Abrir enlace"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-stone-500 truncate">{urlData.original_url}</p>
      </div>

      <button
        type="button"
        onClick={() => onCopy(urlData.short_id)}
        className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 px-3.5 py-2 rounded-lg text-xs font-medium transition inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
      >
        {isCopied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Copiado</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Copiar</span>
          </>
        )}
      </button>
    </div>
  );
}