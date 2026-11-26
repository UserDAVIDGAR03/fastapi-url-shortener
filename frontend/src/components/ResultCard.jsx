import { Copy, Check, BarChart2, QrCode } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function ResultCard({
  urlData,
  copiedId,
  onCopy,
  onOpenDetails,
  onOpenQr,
}) {
  if (!urlData) return null;

  const shortUrl = `${API_BASE_URL}/${urlData.short_id}`;
  const isCopied = copiedId === urlData.short_id;
  const originalLen = urlData.original_url?.length || 0;
  const shortLen = shortUrl.length;
  const savedPercent =
    originalLen > 0
      ? Math.max(0, Math.round(((originalLen - shortLen) / originalLen) * 100))
      : 0;

  return (
    <div className="mt-5 pt-4 border-t border-zinc-100 space-y-3">
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span className="font-semibold text-zinc-700">ATAJO</span>
        <span>
          {shortLen} CARACTERES · {savedPercent}% MENOS
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-50 border border-zinc-200/90 rounded-lg px-3.5 py-2.5">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs sm:text-sm font-semibold text-blue-600 hover:underline truncate"
        >
          {shortUrl}
        </a>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onCopy(urlData.short_id)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {onOpenQr && (
            <button
              type="button"
              onClick={() => onOpenQr(urlData.short_id)}
              className="inline-flex items-center gap-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
              title="Código QR"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR</span>
            </button>
          )}

          {onOpenDetails && (
            <button
              type="button"
              onClick={() => onOpenDetails(urlData.short_id)}
              className="inline-flex items-center gap-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
              title="Ver analíticas"
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Detalles</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}