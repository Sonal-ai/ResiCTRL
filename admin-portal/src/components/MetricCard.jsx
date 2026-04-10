import clsx from 'clsx';

export default function MetricCard({ title, value, icon: Icon, trend, type = 'default' }) {
  return (
    <div className="admin-card p-6 flex flex-col relative overflow-hidden group">
      {/* Decorative gradient orb */}
      <div className={clsx(
        "absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20",
        type === 'danger' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-admin-accent)]'
      )} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2.5 rounded-xl bg-[var(--color-admin-border)]/50 border border-[var(--color-admin-border)]">
          <Icon className={clsx(
            "w-5 h-5",
            type === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-admin-accent)]'
          )} />
        </div>
        {trend && (
          <span className={clsx(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trend.startsWith('+') ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
          )}>
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-[var(--color-admin-muted)] text-sm font-medium tracking-wide mb-1 uppercase">{title}</h3>
        <p className="text-3xl font-semibold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
