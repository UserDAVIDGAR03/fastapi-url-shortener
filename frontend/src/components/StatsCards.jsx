export default function StatsCards({ urls }) {
  const totalLinks = urls.length;
  const activeLinks = urls.filter((u) => u.is_active).length;
  const totalClicks = urls.reduce((acc, item) => acc + (item.clicks || 0), 0);
  const topUrl = urls.reduce(
    (max, item) => (item.clicks > (max?.clicks || 0) ? item : max),
    null
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-stone-500">Enlaces creados</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{totalLinks}</p>
        </div>
        <span className="text-xs font-medium text-[#1E3A5F] bg-blue-50 px-2.5 py-1 rounded-full">
          {activeLinks} {activeLinks === 1 ? 'activo' : 'activos'}
        </span>
      </div>

      <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-stone-500">Clics en total</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{totalClicks}</p>
        </div>
        <span className="text-xs text-stone-400">redirecciones</span>
      </div>

      <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-xs font-medium text-stone-500">Con más visitas</p>
          <p className="text-lg font-bold text-[#C2410C] truncate mt-1">
            {topUrl && topUrl.clicks > 0 ? `/${topUrl.short_id}` : 'Sin visitas aún'}
          </p>
        </div>
        {topUrl && topUrl.clicks > 0 && (
          <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full shrink-0">
            {topUrl.clicks} {topUrl.clicks === 1 ? 'clic' : 'clics'}
          </span>
        )}
      </div>
    </div>
  );
}