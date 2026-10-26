import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievances } from '../context/GrievanceContext';
import {
  PlusCircle,
  Search,
  Filter,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Factory,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import GrievanceCard from '../components/GrievanceCard';
import LocationBadge from '../components/LocationBadge';
import GrievanceDetailModal from './GrievanceDetailModal';
import SubmitGrievanceModal from './SubmitGrievanceModal';

export default function EmployeeDashboard({ isSubmitOpen, setIsSubmitOpen }) {
  const { user } = useAuth();
  const { grievances, loading, error, selectedGrievance, setSelectedGrievance } = useGrievances();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Filtering
  const filteredGrievances = grievances.filter(g => {
    const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCount = grievances.length;
  const inProgressCount = grievances.filter(g => g.status === 'In Progress' || g.status === 'Under Review' || g.status === 'Submitted').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 space-y-3">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-4 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                EMPLOYEE ID: {user.empId}
              </span>
              <LocationBadge location={user.location} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-slate-600 font-medium max-w-xl">
              {user.designation} • {user.department}
            </p>
            <p className="text-xs text-slate-500">
              Submit workplace concerns, safety hazards, equipment issues, or payroll inquiries directly to your location's Associate Admin cell.
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Lodge New Grievance</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Grievances</p>
            <p className="text-2xl font-black text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Under Action / Active</p>
            <p className="text-2xl font-black text-amber-600">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Cases</p>
            <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Grievance Inbox List & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-900">
              My Grievance History ({filteredGrievances.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket title or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {['ALL', 'Submitted', 'Under Review', 'In Progress', 'Resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of grievances */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Loading your grievance records...
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Grievance Tickets Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't filed any grievances matching this filter criteria. Need to report an issue or workplace hazard?
            </p>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm shadow-red-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              Lodge New Grievance
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGrievances.map((g) => (
              <GrievanceCard
                key={g.id}
                grievance={g}
                onClick={() => setSelectedGrievance(g)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Submit Modal */}
      <SubmitGrievanceModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />

      {/* Grievance Details Modal */}
      {selectedGrievance && (
        <GrievanceDetailModal
          grievance={selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
        />
      )}

    </div>
  );
}
