import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievances } from '../context/GrievanceContext';
import {
  X,
  MapPin,
  Calendar,
  User,
  Shield,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Lock,
  Tag,
  Trash2,
  Crown
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LocationBadge from '../components/LocationBadge';
import TimelineView from '../components/TimelineView';

export default function GrievanceDetailModal({ grievance, onClose }) {
  const { user, currentMode, directoryUsers } = useAuth();
  const { updateGrievance, addComment, deleteGrievanceTicket } = useGrievances();

  const [newStatus, setNewStatus] = useState(grievance?.status || 'Submitted');
  const [statusNote, setStatusNote] = useState('');
  const [assignedAdminId, setAssignedAdminId] = useState(grievance?.assignedTo?.id || '');
  const [remarkText, setRemarkText] = useState('');
  const [remarkType, setRemarkType] = useState('public'); // 'public' | 'internal'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [isStatusConfirmed, setIsStatusConfirmed] = useState(false);

  if (!grievance) return null;

  const isSuperAdmin = (currentMode === 'super_admin' || (!currentMode && user?.role === 'super_admin')) && (user?.role === 'super_admin' || user?.isSuperAdmin);
  const isEmployee = currentMode === 'employee' || user?.role === 'employee';
  const isAdmin = !isEmployee && (isSuperAdmin || user?.role === 'admin');
  const isHOAdmin = !isEmployee && (isSuperAdmin || (user?.role === 'admin' && (user.location === 'H.O' || user.isGlobalAdmin)));

  // Available admins for this grievance's location or HO (all admins for super admin)
  const availableAdmins = directoryUsers.filter(u =>
    (u.role === 'admin' || u.role === 'super_admin') && (isSuperAdmin || u.location === grievance.location || u.location === 'H.O')
  );

  const isAllotted = !isSuperAdmin && Boolean(grievance.assignedTo && grievance.assignedTo.id);

  const handleDeleteTicket = async () => {
    if (!window.confirm(`Permanently delete grievance ${grievance.ticketNumber} from MySQL database? This action cannot be reversed.`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteGrievanceTicket(grievance.id);
      alert(`Ticket ${grievance.ticketNumber} permanently purged from database.`);
      onClose();
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatusAndAssign = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionSuccess('');
    try {
      const selectedAdminObj = availableAdmins.find(a => a.id === assignedAdminId);
      const payload = {
        status: newStatus,
        statusNote: statusNote.trim() || `Status updated to ${newStatus} by ${user.name}`,
        assignedTo: isAllotted
          ? grievance.assignedTo
          : (selectedAdminObj ? {
              id: selectedAdminObj.id,
              empId: selectedAdminObj.empId,
              name: selectedAdminObj.name,
              designation: selectedAdminObj.designation
            } : grievance.assignedTo)
      };

      if (remarkText.trim()) {
        payload.remark = remarkText.trim();
        payload.remarkType = remarkType;
      }

      await updateGrievance(grievance.id, payload);
      setActionSuccess('Grievance ticket successfully updated!');
      setRemarkText('');
      setStatusNote('');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!window.confirm('Are you sure you want to escalate this ticket to H.O Corporate Executive Committee?')) return;
    setIsSubmitting(true);
    try {
      await updateGrievance(grievance.id, {
        status: 'Escalated',
        escalateToHO: true,
        statusNote: `Escalated to H.O Executive Committee by ${user.name} for urgent intervention.`
      });
      setActionSuccess('Ticket escalated to Head Office!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCommentOnly = async (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment(grievance.id, remarkText.trim(), remarkType);
      setRemarkText('');
      setActionSuccess('Comment added successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded">
                {grievance.ticketNumber || grievance.id}
              </span>
              <LocationBadge location={grievance.location} />
              <PriorityBadge priority={grievance.priority} />
              <StatusBadge status={grievance.status} />
              {grievance.escalatedToHO && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> Escalated to H.O
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{grievance.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left / Main Details (2 cols on large) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-red-600" />
                Grievance Description & Particulars
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {grievance.description}
              </p>

              {grievance.specificArea && (
                <div className="pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>Specific Shop / Location: <strong className="text-slate-800">{grievance.specificArea}</strong></span>
                </div>
              )}
            </div>

            {/* Admin Action Box (If user is Admin) */}
            {isAdmin ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    Associate Admin Resolution & Action Panel
                  </h4>
                  {grievance.location !== 'H.O' && !grievance.escalatedToHO && (
                    <button
                      onClick={handleEscalate}
                      disabled={isSubmitting}
                      className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      Escalate to H.O
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateStatusAndAssign} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Status Select */}
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Update Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => {
                          setNewStatus(e.target.value);
                          setIsStatusConfirmed(false);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-600 shadow-xs"
                      >
                        <option value="Submitted">Submitted (Pending Initial Review)</option>
                        <option value="Under Review">Under Review (Investigation Active)</option>
                        <option value="In Progress">In Progress (Corrective Action Taken)</option>
                        <option value="Resolved">Resolved (Satisfactorily Closed)</option>
                        <option value="Rejected">Rejected (Not Feasible / Invalid)</option>
                      </select>
                    </div>

                    {/* Assigned Admin Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-600 font-medium">Assigned Associate Admin</label>
                        {isAllotted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <Lock className="w-2.5 h-2.5 text-amber-600" /> Allotted (Locked)
                          </span>
                        )}
                      </div>
                      {isAllotted ? (
                        <div className="w-full bg-slate-100/90 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium flex items-center justify-between shadow-xs select-none">
                          <span className="truncate">
                            {grievance.assignedTo.name} ({grievance.assignedTo.designation || 'Associate Admin'})
                          </span>
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                        </div>
                      ) : (
                        <select
                          value={assignedAdminId}
                          onChange={(e) => setAssignedAdminId(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-600 shadow-xs"
                        >
                          <option value="">-- Select Associate Admin to Allot --</option>
                          {availableAdmins.map(admin => (
                            <option key={admin.id} value={admin.id}>
                              {admin.name} ({admin.location} - {admin.designation})
                            </option>
                          ))}
                        </select>
                      )}
                      {isAllotted && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Once allotted, the Assigned Associate Admin is permanent and cannot be changed.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status update note */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Status Change Reason / Note for Audit Log
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dispatched maintenance technician; verified with safety officer..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 shadow-xs"
                    />
                  </div>

                  {/* Official remarks input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-600 font-medium">Add Official Resolution Remark</label>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px] text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="remType"
                            checked={remarkType === 'public'}
                            onChange={() => setRemarkType('public')}
                            className="text-red-600 focus:ring-0"
                          />
                          <span>Public (Visible to Employee)</span>
                        </label>
                        <label className="flex items-center gap-1 text-[11px] text-amber-700 cursor-pointer">
                          <input
                            type="radio"
                            name="remType"
                            checked={remarkType === 'internal'}
                            onChange={() => setRemarkType('internal')}
                            className="text-amber-500 focus:ring-0"
                          />
                          <span>Internal Admin Note</span>
                        </label>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Provide concrete action steps taken, timeline for fix, or official reply..."
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 shadow-xs"
                    />
                  </div>

                  {actionSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{actionSuccess}</span>
                    </div>
                  )}

                  {/* Confirmation Checkbox when updating status */}
                  {newStatus !== grievance.status && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isStatusConfirmed}
                          onChange={(e) => setIsStatusConfirmed(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer accent-red-600"
                        />
                        <span className="text-xs text-amber-900 font-semibold leading-relaxed">
                          I verify and confirm changing ticket status from <strong className="font-bold">{grievance.status}</strong> to <strong className="underline font-bold">{newStatus}</strong>.
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={handleDeleteTicket}
                        disabled={isSubmitting}
                        className="px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition-colors flex items-center gap-1.5 text-xs shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Ticket (Purge from DB)
                      </button>
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                      <button
                        type="submit"
                        disabled={isSubmitting || (newStatus !== grievance.status && !isStatusConfirmed)}
                        className={`px-5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-md ${
                          newStatus !== grievance.status && !isStatusConfirmed
                            ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 cursor-pointer'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isSubmitting ? 'Saving...' : 'Apply Status & Remarks'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              /* Employee Comment Box */
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-red-600" />
                  Add Follow-Up / Additional Information
                </h4>
                <form onSubmit={handleAddCommentOnly} className="space-y-3">
                  <textarea
                    rows={2}
                    placeholder="Type any clarification or update for the associate admin..."
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 shadow-xs"
                  />
                  {actionSuccess && (
                    <p className="text-xs text-emerald-600 font-semibold">{actionSuccess}</p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !remarkText.trim()}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit Update
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Timeline & Audit */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <TimelineView timeline={grievance.timeline} remarks={grievance.remarks} />
            </div>

          </div>

          {/* Right Column: Meta & Submitter Info (1 col) */}
          <div className="space-y-4">
            
            {/* Submitter card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-red-600" />
                Lodged By
              </h4>

              {grievance.isAnonymous ? (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-purple-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Identity Protected
                  </p>
                  <p className="text-purple-600">
                    This grievance was submitted anonymously. Personal employee credentials are masked.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Employee Name</span>
                    <span className="font-bold text-slate-900 text-sm">{grievance.submittedBy?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Employee ID</span>
                    <span className="font-mono text-red-600 font-semibold">{grievance.submittedBy?.empId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Designation</span>
                    <span className="text-slate-700">{grievance.submittedBy?.designation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Department</span>
                    <span className="text-slate-700">{grievance.submittedBy?.department}</span>
                  </div>
                  {grievance.submittedBy?.email && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="text-slate-500 font-mono text-[11px] truncate block">
                        {grievance.submittedBy?.email}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Assigned Associate Admin */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-600" />
                  Handling Associate Admin
                </h4>
                {grievance.assignedTo && (
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-600" /> Allotted
                  </span>
                )}
              </div>
              {grievance.assignedTo ? (
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900">{grievance.assignedTo.name}</p>
                  <p className="text-slate-500 text-[11px]">{grievance.assignedTo.designation}</p>
                  <span className="inline-block mt-1 font-mono text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    {grievance.assignedTo.empId}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-amber-600 italic">Unassigned (Under General Pool)</p>
              )}
            </div>

            {/* Grievance Details Meta */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                <Tag className="w-4 h-4 text-red-600" />
                Ticket Metadata
              </h4>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-medium text-slate-800">{grievance.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Location</span>
                <LocationBadge location={grievance.location} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date Lodged</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {new Date(grievance.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Last Activity</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {new Date(grievance.updatedAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
