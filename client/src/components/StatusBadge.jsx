import React from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle, ArrowUpRight } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    'Submitted': {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: Clock,
      dot: 'bg-amber-500'
    },
    'Under Review': {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: RefreshCw,
      dot: 'bg-blue-500 animate-pulse'
    },
    'In Progress': {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      icon: RefreshCw,
      dot: 'bg-indigo-500 animate-spin'
    },
    'Resolved': {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: CheckCircle2,
      dot: 'bg-emerald-500'
    },
    'Escalated': {
      bg: 'bg-purple-50 border-purple-200 text-purple-800',
      icon: ArrowUpRight,
      dot: 'bg-purple-500'
    },
    'Rejected': {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: XCircle,
      dot: 'bg-rose-500'
    }
  };

  const current = configs[status] || {
    bg: 'bg-slate-100 border-slate-200 text-slate-700',
    icon: AlertCircle,
    dot: 'bg-slate-500'
  };

  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses} shadow-sm backdrop-blur-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {status}
    </span>
  );
}
