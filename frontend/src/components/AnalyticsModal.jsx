import { useEffect, useState } from 'react';
import { X, Clock, Monitor, Globe } from 'lucide-react';
import { getUrlAnalytics } from '../services/api';

export default function AnalyticsModal({ shortId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shortId) return;
    setLoading(true);
    getUrlAnalytics(shortId)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [shortId]);

  if (!shortId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 font-mono">Analíticas: /{shortId}</h3>
            {data && (
              <p className="text-xs text-zinc-500 truncate max-w-sm mt-0.5">{data.original_url}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <p className="text-xs text-zinc-500 py-8 text-center">Cargando registros...</p>
          ) : !data?.events || data.events.length === 0 ? (
            <p className="text-xs text-zinc-500 py-8 text-center">
              Aún no se han registrado clics en este enlace.
            </p>
          ) : (
            [...data.events].reverse().map((ev) => (
              <div
                key={ev.id}
                className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {new Date(ev.clicked_at).toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Globe className="w-3 h-3" />
                    {ev.referer || 'Directo'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 truncate">
                  <Monitor className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{ev.user_agent}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}