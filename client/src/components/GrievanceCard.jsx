import React from 'react';
import { Calendar, User, MapPin, Tag, ChevronRight, MessageSquare, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import LocationBadge from './LocationBadge';

export default function GrievanceCard({ grievance, onClick, isAdmin = false }) {
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-slate-200 hover:border-red-500/50 rounded-xl p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top meta row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-500 group-hover:text-red-600 transition-colors">
              {grievance.ticketNumber || grievance.id}
            </span>
            <LocationBadge location={grievance.location} size="sm" />
            {grievance.isAnonymous && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5" /> Anonymous
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={grievance.priority} size="sm" />
            <StatusBadge status={grievance.status} size="sm" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
          {grievance.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {grievance.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            {grievance.category}
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {grievance.isAnonymous ? 'Confidential' : grievance.submittedBy?.name || 'Employee'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {grievance.remarks?.length > 0 && (
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-red-600" />
              {grievance.remarks.length}
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(grievance.createdAt)}
          </span>
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
