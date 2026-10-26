import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievances } from '../context/GrievanceContext';
import {
  X,
  PlusCircle,
  Shield,
  MapPin,
  AlertTriangle,
  FileText,
  Lock,
  Upload,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

import LocationBadge from '../components/LocationBadge';

const CATEGORIES = [
  'Workplace Safety & Health',
  'Machinery & Equipment Malfunction',
  'Working Conditions & Ergonomics',
  'Payroll, Overtime & Benefits',
  'Shift Schedule & Transport',
  'Facilities, Canteen & Hygiene',
  'Harassment & Code of Conduct',
  'Management & Administrative Policy',
  'Environmental & Waste Hazards',
  'Other Grievance / Suggestion'
];

const LOCATION_NAMES = {
  'H.O': 'Head Office (Corporate Complex)',
  '1F': 'Factory 1 (Chassis & Assembly Plant)',
  '2F': 'Factory 2 (Engine & Machining Plant)',
  '3F': 'Factory 3 (EV & Body Assembly Plant)',
  '4F': 'Factory 4 (Casting & Logistics Plant)'
};

export default function SubmitGrievanceModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { lodgeGrievance } = useGrievances();

  const userLocation = user?.location || '1F';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [specificArea, setSpecificArea] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide a clear title and description of your grievance.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        location: userLocation, // Automatically locked to user's detected location
        specificArea: specificArea.trim(),
        priority,
        description: description.trim(),
        isAnonymous,
        attachmentName: fileName || null
      };

      await lodgeGrievance(payload);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      // Reset form
      setTitle('');
      setDescription('');
      setSpecificArea('');
      setIsAnonymous(false);
      setFileName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit grievance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Lodge Official Honda Grievance</h3>
              <p className="text-xs text-slate-500">
                Directly routed to the designated Location Associate Admin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Location Static Card */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 sm:px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
              {/* Plant Location */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" />
                  Plant Location:
                </span>
                <LocationBadge location={userLocation} isHOGlobal={user?.isGlobalAdmin} size="sm" />
                <span className="font-bold text-slate-800 text-xs truncate">
                  {LOCATION_NAMES[userLocation] || userLocation}
                </span>
              </div>

              {/* Target Redressal Cell */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Target Cell:
                </span>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="font-bold text-slate-800 text-xs whitespace-nowrap">
                    {userLocation} Associate Admin Cell
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grievance Title */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Grievance Subject / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Malfunctioning ventilation in Paint Shop Line 2..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Specific Area & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Specific Workstation / Shop / Floor
              </label>
              <input
                type="text"
                placeholder="e.g. Bay 4, Line 3, Canteen Block B..."
                value={specificArea}
                onChange={(e) => setSpecificArea(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Severity / Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {['Low', 'Medium', 'High', 'Critical'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      priority === lvl
                        ? lvl === 'Critical'
                          ? 'bg-red-600 text-white shadow-xs'
                          : lvl === 'High'
                          ? 'bg-orange-600 text-white'
                          : lvl === 'Medium'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-white'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Comprehensive Statement & Evidence <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the incident, safety risk, malfunction, or concern in complete detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors leading-relaxed shadow-xs"
            />
          </div>

          {/* Optional Attachment & Anonymous toggle */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            
            {/* Attachment mock */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Supporting Photo / Document (Optional)
              </label>
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 cursor-pointer text-slate-700 truncate">
                <Upload className="w-4 h-4 text-red-600 shrink-0" />
                <span className="truncate text-xs">
                  {fileName ? fileName : 'Choose image / PDF report...'}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>
            </div>

            {/* Anonymous Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 pr-2">
                <Lock className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Lodge Anonymously</p>
                  <p className="text-[10px] text-slate-500">Mask employee credentials</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-0 cursor-pointer"
              />
            </div>

          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Submitting to Plant Admin...' : 'Submit Grievance Ticket'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
