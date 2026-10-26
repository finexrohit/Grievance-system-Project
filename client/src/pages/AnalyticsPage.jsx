import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievances } from '../context/GrievanceContext';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Clock,
  Layers,
  CheckCircle2,
  AlertOctagon,
  Download,
  Building2,
  Factory,
  RefreshCw
} from 'lucide-react';
import LocationBadge from '../components/LocationBadge';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { analytics, grievances, fetchAnalytics, loading } = useGrievances();

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading analytics metrics...
      </div>
    );
  }

  const exportCSV = () => {
    const headers = ['Ticket ID', 'Location', 'Category', 'Priority', 'Status', 'Submitted By', 'Created At'];
    const rows = grievances.map(g => [
      g.ticketNumber || g.id,
      g.location,
      `"${g.category}"`,
      g.priority,
      g.status,
      g.isAnonymous ? 'Anonymous' : `"${g.submittedBy?.name || ''}"`,
      `"${new Date(g.createdAt).toLocaleString('en-IN')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Honda_Grievances_${user.location}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = Object.entries(analytics.categories || {});
  const priorities = Object.entries(analytics.priorities || {});
  const locations = Object.entries(analytics.locations || {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 space-y-3">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-red-600" />
                EXECUTIVE ANALYTICS & AUDIT
              </span>
              <LocationBadge location={user.location} isHOGlobal={user.location === 'H.O'} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Grievance Metrics & Redressal Performance
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Real-time reporting across plant facilities, response compliance, and categorical distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalytics}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV Dataset
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Logged Tickets</span>
            <Layers className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{analytics.total}</p>
          <p className="text-[11px] text-slate-400">Across current organizational scope</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Resolution Success Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{analytics.resolutionRate}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.resolutionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Action Queue</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">{analytics.pending}</p>
          <p className="text-[11px] text-slate-400">{analytics.submitted} new, {analytics.inProgress} in progress</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Resolved Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{analytics.resolved}</p>
          <p className="text-[11px] text-slate-400">Successfully closed with remarks</p>
        </div>

      </div>

      {/* Grid: Location Distribution & Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Location Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Factory className="w-4 h-4 text-red-600" />
              Plant Facility Distribution (5 Locations)
            </h3>
            <span className="text-xs text-slate-500 font-mono">5 Locations</span>
          </div>

          <div className="space-y-3 pt-2">
            {locations.map(([loc, count]) => {
              const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
              return (
                <div key={loc} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <LocationBadge location={loc} size="sm" />
                      <span>{loc === 'H.O' ? 'Head Office' : `Factory Plant ${loc}`}</span>
                    </span>
                    <span className="font-mono text-slate-500">{count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Severity Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              Severity & Priority Distribution
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {priorities.map(([prio, count]) => {
              const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
              const colorClass =
                prio === 'Critical' ? 'bg-red-500' :
                prio === 'High' ? 'bg-orange-500' :
                prio === 'Medium' ? 'bg-amber-500' : 'bg-slate-400';

              return (
                <div key={prio} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{prio} Priority</span>
                    <span className="font-mono text-slate-500">{count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`${colorClass} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red-600" />
          Categorical Distribution of Grievances
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {categories.map(([cat, count]) => {
            const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
            return (
              <div key={cat} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{cat}</span>
                  <span className="font-mono font-bold text-red-600">{count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
