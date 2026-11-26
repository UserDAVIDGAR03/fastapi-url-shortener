import { useState, useRef, useEffect } from 'react';
import {
  Clock,
  Copy,
  Check,
  BarChart2,
  MoreVertical,
  QrCode,
  Power,
  Trash2,
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';

function formatRelativeTime(dateValue) {
  if (!dateValue) return 'Reciente';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Reciente';
  const diffSec = Math.max(1, Math.floor((Date.now() - parsed.getTime()) / 1000));
  if (diffSec < 60) return `Hace ${diffSec} s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}

export default function UrlHistoryTable({
  urls = [],
  loading,
  copiedId,
  onCopy,
  onOpenQr,
  onOpenAnalytics,
  onToggle,
  onDelete,
  onViewAll,
  compact = false,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuContainerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const rows = compact ? urls.slice(0, 4) : urls;

  return (
    <div
      ref={menuContainerRef}
      className="bg-white border border-zinc-200/90 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-visible"
    >
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            {compact
              ? 'TUS ENLACES RECIENTES'
              : `HISTORIAL DE ENLACES (${urls.length})`}
          </span>
        </div>

        {compact && onViewAll && urls.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Ver todo →
          </button>
        )}
      </div>

      {loading ? (
        <div className="px-5 py-6 text-xs text-zinc-400 font-mono">
          Cargando enlaces...
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-6 text-xs text-zinc-500">
          Aún no hay enlaces creados. Ingresa una URL arriba para generar tu primer atajo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                <th className="py-2.5 pl-5 pr-3">Enlace original</th>
                <th className="py-2.5 px-3">Atajo</th>
                <th className="py-2.5 px-3">Creado</th>
                <th className="py-2.5 px-3 text-right">Clicks</th>
                <th className="py-2.5 pl-3 pr-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {rows.map((item) => {
                const shortUrl = `${API_BASE_URL}/${item.short_id}`;
                const isCopied = copiedId === item.short_id;
                const isActive = item.is_active !== false;

                return (
                  <tr key={item.short_id} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3 pl-5 pr-3 max-w-[260px]">
                      <a
                        href={item.original_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-700 hover:text-blue-600 truncate block"
                        title={item.original_url}
                      >
                        {item.original_url}
                      </a>
                    </td>

                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`font-medium hover:underline ${
                          isActive ? 'text-blue-600' : 'text-zinc-400 line-through'
                        }`}
                      >
                        {shortUrl}
                      </a>
                    </td>

                    <td className="py-3 px-3 text-zinc-500 whitespace-nowrap">
                      {formatRelativeTime(item.created_at)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-zinc-800 whitespace-nowrap">
                      {item.clicks ?? 0}
                    </td>

                    <td className="py-3 pl-3 pr-5 text-right whitespace-nowrap relative">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onCopy(item.short_id)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
                          title="Copiar atajo"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenAnalytics?.(item.short_id)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 transition cursor-pointer"
                          title="Ver estadísticas"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((prev) =>
                              prev === item.short_id ? null : item.short_id
                            )
                          }
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
                          title="Más acciones"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {openMenuId === item.short_id && (
                        <div className="absolute right-5 top-10 w-40 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-30 text-left text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onOpenQr?.(item.short_id);
                            }}
                            className="w-full px-3 py-1.5 text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Código QR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onToggle?.(item.short_id);
                            }}
                            className="w-full px-3 py-1.5 text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Power className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{isActive ? 'Desactivar' : 'Activar'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onDelete?.(item.short_id);
                            }}
                            className="w-full px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}