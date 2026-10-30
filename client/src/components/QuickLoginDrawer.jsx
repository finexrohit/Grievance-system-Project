import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, Users, Building2, Factory, Search, Check, KeyRound, ExternalLink, Download } from 'lucide-react';
import LocationBadge from './LocationBadge';

export default function QuickLoginDrawer({ isOpen, onClose, onSelectCredentials }) {
  const { directoryUsers, quickSwitchUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('admins'); // 'admins' | 'employees'
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const admins = directoryUsers.filter(u => u.role === 'admin');
  const employees = directoryUsers.filter(u => u.role === 'employee');

  const listToFilter = selectedTab === 'admins' ? admins : employees;

  const filteredUsers = listToFilter.filter(u => {
    const matchesLoc = filterLocation === 'ALL' || u.location === filterLocation;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.empId.toLowerCase().includes(search.toLowerCase()) ||
      u.designation.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    return matchesLoc && matchesSearch;
  });

  const locations = ['ALL', 'H.O', '1F', '2F', '3F', '4F'];

  const handleSelect = (selectedUser) => {
    if (onSelectCredentials) {
      onSelectCredentials(selectedUser.empId, selectedUser.plainPassword || selectedUser.password || 'test@password123');
    } else {
      quickSwitchUser(selectedUser);
    }
    onClose();
  };

  const handleDownloadCredentials = () => {
    const link = document.createElement('a');
    link.href = '/test_login_credentials.txt';
    link.download = 'test_login_credentials.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Demo Accounts & Quick Login
              </h3>
              <p className="text-xs text-slate-500">
                10 Associate Admins across 5 locations & 30+ Test Employees
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

        {/* Global credentials notice & Download Button */}
        <div className="px-5 py-2.5 bg-red-50 border-b border-red-100 flex flex-wrap items-center justify-between gap-2 text-xs text-red-700">
          <span>
            Default password: <strong className="font-mono text-red-800 bg-white border border-red-200 px-2 py-0.5 rounded shadow-xs">test@password123</strong>
          </span>
          <button
            onClick={handleDownloadCredentials}
            className="px-2.5 py-1 rounded bg-white hover:bg-red-600 hover:text-white border border-red-200 text-red-700 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Download full credentials list as TXT"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .TXT File</span>
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setSelectedTab('admins')}
              className={`flex-1 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedTab === 'admins'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              10 Associate Admins (5 Locations)
            </button>
            <button
              onClick={() => setSelectedTab('employees')}
              className={`flex-1 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedTab === 'employees'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Test Employees ({employees.length})
            </button>
          </div>

          {/* Location Filters */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Location:</span>
            {locations.map(loc => (
              <button
                key={loc}
                onClick={() => setFilterLocation(loc)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  filterLocation === loc
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID, or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching accounts found for current criteria.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelect(u)}
                className="group bg-white hover:bg-red-50/30 border border-slate-200 hover:border-red-300 rounded-xl p-3.5 transition-all cursor-pointer flex items-center justify-between shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-red-50 border border-slate-200 group-hover:border-red-200 flex items-center justify-center text-sm font-bold text-red-600 font-mono">
                    {u.location}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                        {u.name}
                      </span>
                      <LocationBadge location={u.location} isHOGlobal={u.isGlobalAdmin} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{u.designation}</p>
                    <p className="text-[11px] text-slate-400">{u.department}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-500">
                      <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                        ID: <strong className="text-red-600">{u.empId}</strong>
                      </span>
                      <span className="truncate max-w-[200px] text-slate-400">{u.email}</span>
                    </div>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 border border-red-200 hover:border-transparent text-red-700 hover:text-white text-xs font-semibold transition-all shrink-0 flex items-center gap-1 shadow-xs">
                  <span>Use ID</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Click any card to auto-login or fill login credentials</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
