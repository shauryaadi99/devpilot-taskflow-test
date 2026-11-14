import React from 'react';
import { CheckCircle2, Clock, Hourglass, Layers, TrendingUp } from 'lucide-react';

const statsConfig = {
  total: {
    label: 'Total Tasks',
    icon: Layers,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    hoverBorder: 'hover:border-indigo-300'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    hoverBorder: 'hover:border-amber-300'
  },
  inProgress: {
    label: 'In Progress',
    icon: Hourglass,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    hoverBorder: 'hover:border-sky-300'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    hoverBorder: 'hover:border-emerald-300'
  }
};

const StatsCard = ({ type, count, isActive, onClick }) => {
  const config = statsConfig[type] || statsConfig.total;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick && onClick()}
      className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer shadow-xs ${
        isActive
          ? `ring-2 ring-indigo-500 border-transparent shadow-md`
          : `border-slate-200 hover:shadow-md ${config.hoverBorder}`
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {config.label}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            {count ?? 0}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${config.bg} ${config.color} border ${config.border}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-3 flex items-center text-xs text-slate-500">
        <span className="font-medium">Click to filter</span>
        {isActive && (
          <span className="ml-auto inline-flex items-center text-xs font-semibold text-indigo-600">
            Active Filter
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

