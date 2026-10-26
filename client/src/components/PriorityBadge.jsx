import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'md' }) {
  const configs = {
    'Critical': {
      bg: 'bg-red-50 border-red-200 text-red-700',
      icon: ShieldAlert,
      glow: 'shadow-xs'
    },
    'High': {
      bg: 'bg-orange-50 border-orange-200 text-orange-700',
      icon: AlertOctagon,
      glow: ''
    },
    'Medium': {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: AlertTriangle,
      glow: ''
    },
    'Low': {
      bg: 'bg-slate-100 border-slate-200 text-slate-700',
      icon: Info,
      glow: ''
    }
  };

  const current = configs[priority] || configs['Medium'];
  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${current.bg} ${sizeClasses} ${current.glow}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {priority} Priority
    </span>
  );
}
