export default function StatsCards({ urls = [] }) {
  if (!urls.length) return null;

  const totalLinks = urls.length;
  const activeLinks = urls.filter((u) => u.is_active !== false).length;
  const totalClicks = urls.reduce((acc, u) => acc + (u.clicks || 0), 0);
  const topUrl = [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];

  return (
    <div className="grid grid-cols-3 bg-white border border-zinc-200/90 rounded-xl divide-x divide-zinc-200/90">
      <div className="p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          ENLACES ACTIVOS
        </p>
        <p className="font-mono text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
          {activeLinks}
          <span className="text-sm font-normal text-zinc-400">/{totalLinks}</span>
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          CLICS TOTALES
        </p>
        <p className="font-mono text-xl sm:text-2xl font-bold text-blue-600 mt-1">
          {totalClicks}
        </p>
      </div>

      <div className="p-4 sm:p-5 min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          MÁS VISITADO
        </p>
        <p className="font-mono text-base sm:text-xl font-bold text-zinc-900 mt-1 truncate">
          {topUrl && (topUrl.clicks || 0) > 0
            ? `/${topUrl.short_id}`
            : '—'}
        </p>
      </div>
    </div>
  );
}