import clsx from 'clsx';

const ACCENT_MAP = {
  default: { icon: 'text-[var(--color-admin-accent)]', orb: 'bg-[var(--color-admin-accent)]' },
  success: { icon: 'text-emerald-500', orb: 'bg-emerald-500' },
  danger: { icon: 'text-red-500', orb: 'bg-red-500' },
  warning: { icon: 'text-amber-500', orb: 'bg-amber-500' },
  purple: { icon: 'text-violet-500', orb: 'bg-violet-500' },
  orange: { icon: 'text-orange-500', orb: 'bg-orange-500' },
};

export default function MetricCard({ title, value, icon: Icon, trend, type = 'default', subtitle }) {
  const accent = ACCENT_MAP[type] || ACCENT_MAP.default;

  return (
    <div className="admin-card p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
      {/* Decorative gradient orb */}
      <div className={clsx(
        "absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20",
        accent.orb
      )} />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className={clsx("p-2 rounded-lg", accent.orb + '/10')}>
          <Icon className={clsx("w-5 h-5", accent.icon)} />
        </div>
        {trend && (
          <span className={clsx(
            "text-[11px] font-semibold px-2 py-0.5 rounded-full",
            trend.startsWith('+') || trend === 'Good' 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : 'bg-red-500/10 text-red-500'
          )}>
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[var(--color-admin-muted)] text-xs font-medium tracking-wide uppercase mb-1">{title}</p>
        <p className="text-3xl font-bold text-[var(--color-admin-text)] tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-[var(--color-admin-muted)] mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
