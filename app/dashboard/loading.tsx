export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-9 w-52 rounded-lg bg-slate-200/80" />
        <div className="h-4 w-72 rounded-lg bg-slate-200/60" />
      </div>

      <div className="space-y-4">
        <div className="h-3 w-20 rounded bg-slate-200/60" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[88px] rounded-xl bg-white shadow-premium" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-44 rounded-xl bg-white shadow-premium" />
        ))}
      </div>

      <div className="h-72 rounded-xl bg-white shadow-premium" />
    </div>
  );
}
