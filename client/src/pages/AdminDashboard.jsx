import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievances } from '../context/GrievanceContext';
import {
  Shield,
  Filter,
  Search,
  Building2,
  Factory,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  User,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Crown,
  SlidersHorizontal,
  X
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LocationBadge from '../components/LocationBadge';
import GrievanceDetailModal from './GrievanceDetailModal';

export default function AdminDashboard() {
  const { user, currentMode } = useAuth();
  const {
    grievances,
    loading,
    error,
    selectedLocationFilter,
    setSelectedLocationFilter,
    selectedGrievance,
    setSelectedGrievance,
    updateGrievance
  } = useGrievances();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Safe Status & Action confirmation state
  const [statusModalGrievance, setStatusModalGrievance] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const isSuperAdmin = (currentMode === 'super_admin' || (!currentMode && user.role === 'super_admin')) && (user.role === 'super_admin' || user.isSuperAdmin);
  const isHOAdmin = isSuperAdmin || user.location === 'H.O' || user.isGlobalAdmin;

  // Filter grievances
  const filteredGrievances = grievances.filter(g => {
    const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || g.priority === priorityFilter;
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      (g.submittedBy?.name && g.submittedBy.name.toLowerCase().includes(search.toLowerCase())) ||
      (g.submittedBy?.empId && g.submittedBy.empId.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const total = grievances.length;
  const pending = grievances.filter(g => g.status === 'Submitted' || g.status === 'Under Review').length;
  const inProgress = grievances.filter(g => g.status === 'In Progress').length;
  const resolved = grievances.filter(g => g.status === 'Resolved').length;

  const locations = ['ALL', 'H.O', '1F', '2F', '3F', '4F'];

  const handleOpenStatusModal = (grievance, preselectedStatus = null) => {
    setStatusModalGrievance(grievance);
    setTargetStatus(preselectedStatus || grievance.status);
    setStatusNote('');
    setIsConfirmed(false);
  };

  const handleCloseStatusModal = () => {
    setStatusModalGrievance(null);
    setTargetStatus('');
    setStatusNote('');
    setIsConfirmed(false);
    setIsSubmittingStatus(false);
  };

  const handleConfirmStatusSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isConfirmed || !statusModalGrievance) return;
    setIsSubmittingStatus(true);
    try {
      await updateGrievance(statusModalGrievance.id, {
        status: targetStatus,
        statusNote: statusNote.trim() || `Status updated from ${statusModalGrievance.status} to ${targetStatus} by ${user.name}`
      });
      handleCloseStatusModal();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
      setIsSubmittingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 space-y-3">
      
      {/* Admin Location Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                isSuperAdmin
                  ? 'text-purple-800 bg-purple-50 border border-purple-300'
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {isSuperAdmin ? <Crown className="w-3.5 h-3.5 text-purple-600" /> : <Shield className="w-3.5 h-3.5 text-red-600" />}
                {isSuperAdmin ? `SUPER ADMINISTRATOR: ${user.empId}` : `ASSOCIATE ADMIN: ${user.empId}`}
              </span>
              <LocationBadge location={user.location} isHOGlobal={isHOAdmin} />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {isSuperAdmin
                ? 'Super Administrator — Global Grievance Management & Resolution Console'
                : isHOAdmin
                ? 'Corporate Head Office (H.O) - Global Grievance Management'
                : `Plant ${user.location} Associate Admin Grievance Cell`}
            </h1>

            <p className="text-xs text-slate-600 font-medium max-w-2xl">
              {isSuperAdmin
                ? 'As Chief Super Administrator, you hold full master oversight and override capability across all 5 operational sites (H.O, 1F, 2F, 3F, 4F). You can inspect, reassign, update, or purge any record.'
                : isHOAdmin
                ? 'As H.O Principal Associate Admin, you hold executive oversight across all 5 operational sites (H.O, 1F, 2F, 3F, 4F) and handle centralized escalations.'
                : `You are 1 of the designated Associate Admins for the ${user.location} Plant. All grievances submitted by ${user.location} associates route to this console.`}
            </p>
          </div>

          {/* Location tab switcher for H.O Admin */}
          {isHOAdmin && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
              <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-xl shadow-xs shrink-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 px-1">
                  Filter By Facility Location:
                </span>
                <div className="flex flex-wrap gap-1">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocationFilter(loc)}
                      className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${
                        selectedLocationFilter === loc
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      {loc === 'ALL' ? 'All 5 Sites' : loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total in Scope</p>
            <p className="text-xl font-black text-slate-900">{total}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending / Under Review</p>
            <p className="text-xl font-black text-amber-600">{pending}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
            <p className="text-xl font-black text-indigo-600">{inProgress}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Resolved Tickets</p>
            <p className="text-xl font-black text-emerald-600">{resolved}</p>
          </div>
        </div>
      </div>

      {/* Main Action Inbox */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-900">
              Grievance Action Queue ({filteredGrievances.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket, employee, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* View toggle */}
            <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded transition-colors ${viewMode === 'table' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded transition-colors ${viewMode === 'cards' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'}`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Fetching plant grievance records...
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <CheckCircle2 className="w-10 h-10 text-emerald-600/60 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Pending Grievances</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All tickets matching the current criteria have been handled or none were submitted.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Plant</th>
                  <th className="py-3 px-4">Subject & Category</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status & Action</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredGrievances.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedGrievance(g)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600">
                      {g.ticketNumber || g.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <LocationBadge location={g.location} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                        {g.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {g.category} {g.specificArea ? `• ${g.specificArea}` : ''}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {g.isAnonymous ? (
                        <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Confidential Associate</span>
                      ) : (
                        <div>
                          <p className="font-bold text-slate-800">{g.submittedBy?.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{g.submittedBy?.empId}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={g.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={g.status} size="sm" />
                        <button
                          onClick={() => handleOpenStatusModal(g, g.status)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                          title="Change status with confirmation"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Action</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGrievance(g);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white transition-colors cursor-pointer"
                        title="View Full Case"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGrievances.map((g) => (
              <GrievanceCard
                key={g.id}
                grievance={g}
                isAdmin={true}
                onClick={() => setSelectedGrievance(g)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Grievance Detail / Action Modal */}
      {selectedGrievance && (
        <GrievanceDetailModal
          grievance={selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
        />
      )}

      {/* --- STATUS CHANGE & ACTION CONFIRMATION MODAL --- */}
      {statusModalGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirm Status Change & Action
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    Ticket: {statusModalGrievance.ticketNumber || statusModalGrievance.id}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseStatusModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmStatusSubmit} className="p-5 space-y-4 text-xs">
              
              {/* Ticket summary banner */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800 text-xs truncate">
                  {statusModalGrievance.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Plant: <strong>{statusModalGrievance.location}</strong></span>
                  <span>•</span>
                  <span>Category: <strong>{statusModalGrievance.category}</strong></span>
                  <span>•</span>
                  <span>By: <strong>{statusModalGrievance.isAnonymous ? 'Confidential' : statusModalGrievance.submittedBy?.name}</strong></span>
                </div>
              </div>

              {/* Status Transition Visualizer */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Select New Status:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setTargetStatus(st);
                        setIsConfirmed(false); // Reset checkbox on status change
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        targetStatus === st
                          ? 'border-red-500 bg-red-50/50 shadow-xs ring-1 ring-red-400'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <StatusBadge status={st} size="sm" />
                        <span className={`font-bold ${targetStatus === st ? 'text-red-900' : 'text-slate-700'}`}>
                          {st}
                        </span>
                      </div>
                      {targetStatus === st && (
                        <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change comparison indicator */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Current:</span>
                  <StatusBadge status={statusModalGrievance.status} size="sm" />
                </div>
                <span className="font-bold text-amber-800">➔</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Target:</span>
                  <StatusBadge status={targetStatus} size="sm" />
                </div>
              </div>

              {/* Status Reason / Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Status Change Note / Audit Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Work order issued; technician dispatched to shop floor..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              {/* MANDATORY CONFIRMATION CHECKBOX */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer accent-red-600"
                  />
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    I verify and confirm changing this grievance status to <strong className="text-slate-900 underline font-bold">{targetStatus}</strong>.
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseStatusModal}
                  disabled={isSubmittingStatus}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isConfirmed || isSubmittingStatus || targetStatus === statusModalGrievance.status}
                  className={`px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    !isConfirmed || targetStatus === statusModalGrievance.status
                      ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingStatus ? 'Updating...' : 'Submit Status Change'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
