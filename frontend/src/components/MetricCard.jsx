import React from 'react';

const MetricCard = ({ title, value, icon, trend, colorClass }) => {
  return (
    <div className="glass-card p-6 flex items-start justify-between group hover:-translate-y-1 transition-transform duration-300">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <p className="text-xs mt-2 text-slate-400">
            <span className={trend > 0 ? "text-emerald-500" : "text-rose-500"}>
              {trend > 0 ? '+' : ''}{trend}%
            </span> from yesterday
          </p>
        )}
      </div>
      <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
  );
};

export default MetricCard;
