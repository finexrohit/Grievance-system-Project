import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  User,
  LogOut,
  BarChart3,
  LayoutDashboard,
  Users,
  ChevronDown,
  UserCheck,
  ArrowLeftRight,
  Crown,
  Database,
  Sparkles
} from 'lucide-react';
import LocationBadge from './LocationBadge';

export default function Navbar({ activeTab, setActiveTab, onOpenSubmitModal }) {
  const {
    user,
    logout,
    isSuperAdminUser,
    currentMode,
    switchToSuperAdmin,
    switchToAdminMode,
    switchToUserMode,
    switchBackToAdmin,
    switchBackToSuperAdmin,
    originalAdmin
  } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  if (!user) return null;

  // Is normal admin browsing in user-mode?
  const isAdminInUserMode = !isSuperAdminUser && !!originalAdmin;

  return (
    <>
      {/* ── Super Admin in Simulated Mode banner ── */}
      {isSuperAdminUser && currentMode !== 'super_admin' && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 border-b border-purple-950 text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs font-semibold shadow-md">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-purple-950 px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider">
              Super Admin Override
            </span>
            <span>
              Simulating <strong>{currentMode === 'admin' ? 'Normal Plant Admin' : 'Normal Associate'} View</strong> ({user.empId}) — Root permissions paused.
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            {currentMode === 'admin' ? (
              <button
                onClick={() => {
                  switchToUserMode();
                  setActiveTab('dashboard');
                }}
                className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Simulate Employee View
              </button>
            ) : (
              <button
                onClick={() => {
                  switchToAdminMode();
                  setActiveTab('dashboard');
                }}
                className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Simulate Plant Admin View
              </button>
            )}
            <button
              onClick={() => {
                switchBackToSuperAdmin();
                setActiveTab('dashboard');
              }}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-purple-950 px-3 py-1 rounded-lg font-black transition-colors shadow-sm"
            >
              <Crown className="w-3.5 h-3.5" />
              Return to Super Admin
            </button>
          </div>
        </div>
      )}

      {/* ── Normal Admin-impersonating-User banner ── */}
      {isAdminInUserMode && (
        <div className="sticky top-0 z-50 bg-amber-400 border-b border-amber-500 text-amber-900 px-4 py-1.5 flex items-center justify-between text-xs font-semibold shadow-sm">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>
              You are viewing as <strong>Employee ({user.empId})</strong> — Admin privileges are suspended.
            </span>
          </div>
          <button
            onClick={() => {
              switchBackToAdmin();
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-1.5 bg-amber-900 text-amber-50 hover:bg-amber-800 px-3 py-1 rounded-lg font-bold transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Back to Admin
          </button>
        </div>
      )}

      <header className={`${(isAdminInUserMode || (isSuperAdminUser && currentMode !== 'super_admin')) ? '' : 'sticky top-0'} z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-md shadow-red-600/30">
                  <span className="font-serif text-xl tracking-tighter">T</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold tracking-wider text-base text-slate-900">
                      TEST
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.2 rounded">
                      Grievance Portal
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-0.5 ml-1.5 pl-1.5 border-l border-slate-200">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-red-50 text-red-600 border border-red-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {currentMode === 'super_admin' ? 'Super Admin Console' : currentMode === 'admin' ? 'Admin Action Inbox' : 'My Grievances'}
                </button>

                {currentMode === 'admin' && (
                  <button
                    onClick={() => setActiveTab('directory')}
                    className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'directory'
                        ? 'bg-red-50 text-red-600 border border-red-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Personnel Directory
                  </button>
                )}

                {(currentMode === 'admin' || currentMode === 'super_admin') && (
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-red-50 text-red-600 border border-red-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics &amp; Reports
                  </button>
                )}

                {currentMode === 'super_admin' && (
                  <button
                    onClick={() => setActiveTab('system')}
                    className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'system'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-purple-600" />
                    System &amp; DB Control
                  </button>
                )}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* User Profile Card */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center gap-2.5 p-1.5 rounded-xl border transition-all text-left ${
                    isSuperAdminUser
                      ? 'bg-purple-50/70 border-purple-200 hover:border-purple-300'
                      : 'bg-slate-100/90 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-xs">
                    {currentMode === 'super_admin' ? (
                      <Crown className="w-4 h-4 text-purple-600" />
                    ) : currentMode === 'admin' ? (
                      <Shield className="w-4 h-4 text-red-600" />
                    ) : isAdminInUserMode ? (
                      <UserCheck className="w-4 h-4 text-amber-600" />
                    ) : (
                      <User className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{user.name}</span>
                      {currentMode === 'super_admin' ? (
                        <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 font-extrabold px-1.5 py-0.2 rounded uppercase">
                          Super Admin
                        </span>
                      ) : currentMode === 'admin' ? (
                        <span className="text-[10px] bg-red-100 text-red-800 border border-red-200 font-extrabold px-1.5 py-0.2 rounded uppercase">
                          Plant Admin
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-1.5 py-0.2 rounded uppercase">
                          Associate
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate max-w-[140px] font-medium">
                      {user.designation}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown menu */}
                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-3 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="pb-2.5 mb-2.5 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                          {currentMode === 'super_admin' ? (
                            <span className="text-[9px] bg-purple-100 text-purple-800 border border-purple-200 font-black px-1.5 py-0.2 rounded uppercase">
                              Super Admin
                            </span>
                          ) : currentMode === 'admin' ? (
                            <span className="text-[9px] bg-red-100 text-red-800 border border-red-200 font-black px-1.5 py-0.2 rounded uppercase">
                              Plant Admin
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-black px-1.5 py-0.2 rounded uppercase">
                              Associate
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs font-medium">{user.designation}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                            {user.empId}
                          </span>
                          <LocationBadge location={user.location} isHOGlobal={user.isGlobalAdmin} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">{user.department}</p>
                      </div>

                      {/* --- Super Admin Tri-Mode Switcher --- */}
                      {isSuperAdminUser && (
                        <div className="pb-2.5 mb-2.5 border-b border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Switch Operating View Mode:
                          </p>
                          <div className="space-y-1">
                            {/* Option 1: Super Admin */}
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                switchToSuperAdmin();
                                setActiveTab('dashboard');
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                                currentMode === 'super_admin'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Crown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>Super Admin Console</span>
                              </div>
                              {currentMode === 'super_admin' ? (
                                <span className="text-[9px] bg-purple-700 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                                  Current
                                </span>
                              ) : (
                                <span className="text-[10px] text-purple-600 font-semibold">Switch</span>
                              )}
                            </button>

                            {/* Option 2: Normal Admin */}
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                switchToAdminMode();
                                setActiveTab('dashboard');
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                                currentMode === 'admin'
                                  ? 'bg-red-50 text-red-900 border border-red-300'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                <span>Normal Plant Admin View</span>
                              </div>
                              {currentMode === 'admin' ? (
                                <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                                  Current
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-semibold">Switch</span>
                              )}
                            </button>

                            {/* Option 3: Normal Employee */}
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                switchToUserMode();
                                setActiveTab('dashboard');
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                                currentMode === 'employee'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Normal Employee View</span>
                              </div>
                              {currentMode === 'employee' ? (
                                <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                                  Current
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-semibold">Switch</span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        {/* Regular Admin switch buttons (when NOT super admin) */}
                        {!isSuperAdminUser && user.role === 'admin' && !isAdminInUserMode && (
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              switchToUserMode();
                              setActiveTab('dashboard');
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 text-amber-800 flex items-center gap-2.5 font-semibold border border-amber-200 bg-amber-50/60 transition-colors"
                          >
                            <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="leading-tight">Switch to User View</div>
                              <div className="text-[10px] text-amber-600 font-normal">Submit grievances as yourself</div>
                            </div>
                          </button>
                        )}

                        {!isSuperAdminUser && isAdminInUserMode && (
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              switchBackToAdmin();
                              setActiveTab('dashboard');
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 text-amber-800 flex items-center gap-2.5 font-semibold border border-amber-200 bg-amber-50/60 transition-colors"
                          >
                            <ArrowLeftRight className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="leading-tight">Back to Admin View</div>
                              <div className="text-[10px] text-amber-600 font-normal">Return to admin console</div>
                            </div>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 flex items-center gap-2.5 font-semibold transition-colors"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        {(currentMode === 'admin' || currentMode === 'super_admin') && (
          <div className="md:hidden flex items-center justify-around border-t border-slate-200 px-2 py-1.5 bg-white">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                activeTab === 'dashboard' ? 'text-red-600 font-bold bg-red-50' : 'text-slate-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                activeTab === 'directory' ? 'text-red-600 font-bold bg-red-50' : 'text-slate-600'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                activeTab === 'analytics' ? 'text-red-600 font-bold bg-red-50' : 'text-slate-600'
              }`}
            >
              Analytics
            </button>
            {currentMode === 'super_admin' && (
              <button
                onClick={() => setActiveTab('system')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  activeTab === 'system' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600'
                }`}
              >
                System
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
}
