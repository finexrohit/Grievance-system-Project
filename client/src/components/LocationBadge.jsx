import React from 'react';
import { MapPin, Building2, Factory } from 'lucide-react';

export default function LocationBadge({ location, isHOGlobal = false, size = 'md' }) {
  const configs = {
    'H.O': {
      bg: 'bg-red-50 border-red-200 text-red-700',
      label: 'Head Office (H.O)',
      icon: Building2
    },
    '1F': {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      label: 'Factory 1 (1F Plant)',
      icon: Factory
    },
    '2F': {
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
      label: 'Factory 2 (2F Plant)',
      icon: Factory
    },
    '3F': {
      bg: 'bg-purple-50 border-purple-200 text-purple-700',
      label: 'Factory 3 (3F Plant)',
      icon: Factory
    },
    '4F': {
      bg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
      label: 'Factory 4 (4F Plant)',
      icon: Factory
    }
  };

  const current = configs[location] || {
    bg: 'bg-slate-100 border-slate-200 text-slate-700',
    label: location,
    icon: MapPin
  };

  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${current.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{location}</span>
      {isHOGlobal && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold shadow-xs">ALL SITES</span>}
    </span>
  );
}
