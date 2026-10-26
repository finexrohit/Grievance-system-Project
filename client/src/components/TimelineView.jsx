import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, ArrowUpRight, MessageSquare, UserCheck } from 'lucide-react';

export default function TimelineView({ timeline = [], remarks = [] }) {
  const getTimelineIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Under Review':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-indigo-400" />;
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Escalated':
        return <ArrowUpRight className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Lifecycle Progression & Audit Trail
        </h4>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-slate-300 shadow-xs flex items-center justify-center">
                {getTimelineIcon(item.status)}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-800">{item.status}</span>
                  <span className="text-xs text-slate-500">{formatDate(item.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-600">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {remarks && remarks.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-red-600" />
            Official Remarks & Communication Notes ({remarks.length})
          </h4>
          <div className="space-y-3">
            {remarks.map((rem, idx) => (
              <div
                key={rem.id || idx}
                className={`p-3 rounded-lg border text-sm ${
                  rem.type === 'internal'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : rem.role === 'admin'
                    ? 'bg-red-50/50 border-red-200 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{rem.author}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-mono border border-slate-200">
                      {rem.role === 'admin' ? 'Associate Admin' : 'Employee'}
                    </span>
                    {rem.type === 'internal' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-medium">
                        Internal Admin Note
                      </span>
                    )}
                  </div>
                  <span>{formatDate(rem.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{rem.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
