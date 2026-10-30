import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DirectoryPage from './pages/DirectoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SystemConsolePage from './pages/SystemConsolePage';
import Navbar from './components/Navbar';
import SubmitGrievanceModal from './pages/SubmitGrievanceModal';

export default function App() {
  const { user, currentMode } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'forgot'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'directory' | 'analytics' | 'system'
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // In employee mode (or when user has employee role), render employee dashboard and views
  const isEmployeeMode = currentMode === 'employee' || user?.role === 'employee';
  const isAdminOrSuper = !isEmployeeMode && (user?.role === 'admin' || user?.role === 'super_admin' || user?.isSuperAdmin);

  // If switched to employee mode and activeTab was on an admin-only tab, switch back to dashboard
  React.useEffect(() => {
    if (isEmployeeMode && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  }, [isEmployeeMode, activeTab]);

  // If user is not logged in
  if (!user) {
    if (authView === 'forgot') {
      return <ForgotPasswordPage onNavigateLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateForgot={() => setAuthView('forgot')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          isAdminOrSuper ? (
            <AdminDashboard />
          ) : (
            <EmployeeDashboard
              isSubmitOpen={isSubmitModalOpen}
              setIsSubmitOpen={setIsSubmitModalOpen}
            />
          )
        )}

        {isAdminOrSuper && activeTab === 'directory' && <DirectoryPage />}

        {isAdminOrSuper && activeTab === 'analytics' && <AnalyticsPage />}

        {!isEmployeeMode && (user.role === 'super_admin' || user.isSuperAdmin) && activeTab === 'system' && (
          <SystemConsolePage />
        )}
      </main>

      {/* Global Submit Grievance Modal */}
      <SubmitGrievanceModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Test — Employee Grievance Redressal & Resolution System</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>5 Factory Locations: H.O | 1F | 2F | 3F | 4F</span>
            <span>•</span>
            <span>10 Associate Admins</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
