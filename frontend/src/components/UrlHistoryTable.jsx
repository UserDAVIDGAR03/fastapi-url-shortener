import { useState } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Search,
  QrCode,
  BarChart2,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import { API_BASE_URL, toggleUrlStatus, deleteUrl } from '../services/api';

export default function UrlHistoryTable({
  urls,
  loading,
  copiedId,
  onCopy,
  onRefresh,
  onOpenQr,
  onOpenAnalytics,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUrls = urls.filter((item) => {
    const matchesText =
      item.original_url.toLowerCase().includes(search.toLowerCase()) ||
      item.short_id.toLowerCase().includes(search.toLowerCase());

    if (!matchesText) return false;
    if (statusFilter === 'active') return item.is_active;
    if (statusFilter === 'paused') return !item.is_active;
    return true;
  });

  const handleToggle = async (shortId) => {
    try {
      await toggleUrlStatus(shortId);
      onRefresh();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleDelete = async (shortId) => {
    try {
      await deleteUrl(shortId);
      onRefresh();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  const formatDomain = (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <section className="flex-1 flex flex-col bg-white border border-stone-200/90 rounded-xl overflow-hidden min-h-[340px]">
      <div className="px-5 py-4 border-b border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Tus enlaces</h2>
          <p className="text-xs text-stone-500">
            Administra tus rutas, consulta estadísticas o genera un código QR
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex bg-stone-100 p-1 rounded-lg">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Activos' },
              { id: 'paused', label: 'Pausados' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-stone-900 font-medium shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-[#1E3A5F] focus:bg-white rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 outline-none transition"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="text-stone-700 hover:text-stone-950 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {loading && urls.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-14 text-xs text-stone-500">
          Cargando enlaces...
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-14 text-xs text-stone-500">
          No hay enlaces para mostrar con este filtro.
        </div>
      ) : (
        <div className="divide-y divide-stone-100 flex-1">
          {filteredUrls.map((item) => {
            const isExpired =
              item.expires_at && new Date(item.expires_at) < new Date();
            const canRedirect = item.is_active && !isExpired;

            return (
              <div
                key={item.id}
                className="px-5 py-4 hover:bg-stone-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <a
                      href={`${API_BASE_URL}/${item.short_id}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setTimeout(onRefresh, 600)}
                      className={`font-semibold text-sm inline-flex items-center gap-1 ${
                        canRedirect
                          ? 'text-[#1E3A5F] hover:underline'
                          : 'line-through text-stone-400'
                      }`}
                    >
                      <span>/{item.short_id}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {isExpired ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                        Expirado
                      </span>
                    ) : item.is_active ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Activo
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        Pausado
                      </span>
                    )}
                  </div>

                  <p
                    className="text-xs text-stone-500 truncate max-w-xl"
                    title={item.original_url}
                  >
                    <span className="font-medium text-stone-700">
                      {formatDomain(item.original_url)}
                    </span>{' '}
                    · {item.original_url}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-bold text-stone-900">{item.clicks}</span>
                    <span className="text-xs text-stone-400 ml-1">
                      {item.clicks === 1 ? 'clic' : 'clics'}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onCopy(item.short_id)}
                      title="Copiar enlace"
                      className="p-2 text-stone-500 hover:text-[#1E3A5F] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      {copiedId === item.short_id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenQr(item.short_id)}
                      title="Ver código QR"
                      className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenAnalytics(item.short_id)}
                      title="Ver historial de clics"
                      className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle(item.short_id)}
                      title={item.is_active ? 'Pausar enlace' : 'Reactivar enlace'}
                      className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      {item.is_active ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 text-[#1E3A5F]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.short_id)}
                      title="Eliminar enlace"
                      className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}