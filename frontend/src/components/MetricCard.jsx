import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  trendDirection = 'up',
  color = 'teal',
  tooltip
}) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="card-subtle p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{title}</span>
            {tooltip && (
              <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600">
                <Info className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.teal}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span>{subtitle}</span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded text-xs ${
              trendDirection === 'up'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-rose-700 bg-rose-50'
            }`}
          >
            {trendDirection === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend} {trendLabel && <span className="opacity-75">{trendLabel}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
