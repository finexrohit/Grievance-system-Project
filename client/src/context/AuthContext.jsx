import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('honda_grievance_user');
    return saved ? JSON.parse(saved) : null;
  });
  // Stores the original admin object when an admin switches to user mode
  const [originalAdmin, setOriginalAdmin] = useState(() => {
    const saved = localStorage.getItem('honda_grievance_original_admin');
    return saved ? JSON.parse(saved) : null;
  });
  // Stores original Super Admin object when Super Admin switches to admin or user mode
  const [originalSuperAdmin, setOriginalSuperAdmin] = useState(() => {
    const saved = localStorage.getItem('honda_grievance_original_super_admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if active user is originally a Super Admin
  const isSuperAdminUser = !!(
    originalSuperAdmin ||
    (user && (user.role === 'super_admin' || user.isSuperAdmin || user.empId === 'HND-SPRADM-001'))
  );

  // Current active mode: 'super_admin' | 'admin' | 'employee'
  const currentMode = isSuperAdminUser
    ? (user?.role === 'super_admin' ? 'super_admin' : user?.role === 'admin' ? 'admin' : 'employee')
    : (originalAdmin ? 'employee' : (user?.role === 'admin' ? 'admin' : 'employee'));

  // Fetch all users for quick login switcher and directory
  const fetchDirectory = async () => {
    try {
      const headers = {};
      const activeUser = user || (localStorage.getItem('honda_grievance_user') ? JSON.parse(localStorage.getItem('honda_grievance_user')) : null);
      if (activeUser?.id) {
        headers['x-user-id'] = activeUser.id;
      }
      const res = await fetch('/api/users', { headers });
      if (res.ok) {
        const data = await res.json();
        setDirectoryUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch directory:', err);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      setUser(data.user);
      localStorage.setItem('honda_grievance_user', JSON.stringify(data.user));
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Quick switch user without typing password (for testing / demo purposes)
  const quickSwitchUser = (selectedUser) => {
    setOriginalAdmin(null);
    setOriginalSuperAdmin(null);
    localStorage.removeItem('honda_grievance_original_admin');
    localStorage.removeItem('honda_grievance_original_super_admin');
    setUser(selectedUser);
    localStorage.setItem('honda_grievance_user', JSON.stringify(selectedUser));
  };

  // --- Tri-Mode Switcher: Super Admin, Normal Admin, Normal User ---

  // Switch to Super Admin Mode (full master control)
  const switchToSuperAdmin = () => {
    const base = originalSuperAdmin || user;
    if (!base) return;
    const superProfile = {
      ...base,
      role: 'super_admin',
      isSuperAdmin: true,
      isGlobalAdmin: true,
      designation: 'Chief Super Administrator',
      department: base.department || 'Executive Management & Corporate IT'
    };
    setUser(superProfile);
    setOriginalSuperAdmin(null);
    localStorage.removeItem('honda_grievance_original_super_admin');
    localStorage.setItem('honda_grievance_user', JSON.stringify(superProfile));
  };

  // Switch to Normal Admin Mode (Associate Admin view)
  const switchToAdminMode = () => {
    if (isSuperAdminUser) {
      if (!originalSuperAdmin && user) {
        setOriginalSuperAdmin(user);
        localStorage.setItem('honda_grievance_original_super_admin', JSON.stringify(user));
      }
      const base = originalSuperAdmin || user;
      const adminProfile = {
        ...base,
        role: 'admin',
        isSuperAdmin: false,
        isGlobalAdmin: true,
        designation: 'Head Office Associate Administrator',
        department: 'Corporate Human Resources & Operations'
      };
      setUser(adminProfile);
      localStorage.setItem('honda_grievance_user', JSON.stringify(adminProfile));
    } else if (originalAdmin) {
      switchBackToAdmin();
    }
  };

  // Switch to User (Employee) Mode — submit & track grievances as normal employee
  const switchToUserMode = () => {
    if (isSuperAdminUser) {
      if (!originalSuperAdmin && user) {
        setOriginalSuperAdmin(user);
        localStorage.setItem('honda_grievance_original_super_admin', JSON.stringify(user));
      }
      const base = originalSuperAdmin || user;
      const userProfile = {
        ...base,
        role: 'employee',
        isSuperAdmin: false,
        isGlobalAdmin: false,
        designation: 'Corporate Operations Associate',
        department: 'General Operations & Associate Welfare'
      };
      setUser(userProfile);
      localStorage.setItem('honda_grievance_user', JSON.stringify(userProfile));
    } else if (user && user.role === 'admin') {
      setOriginalAdmin(user);
      localStorage.setItem('honda_grievance_original_admin', JSON.stringify(user));
      const userModeProfile = {
        ...user,
        role: 'employee',
        isSuperAdmin: false,
        isGlobalAdmin: false,
        designation: 'Plant Operations Associate'
      };
      setUser(userModeProfile);
      localStorage.setItem('honda_grievance_user', JSON.stringify(userModeProfile));
    }
  };

  // Switch back from user mode to the original admin session (for normal admins)
  const switchBackToAdmin = () => {
    if (isSuperAdminUser) {
      switchToAdminMode();
      return;
    }
    if (!originalAdmin) return;
    setUser(originalAdmin);
    localStorage.setItem('honda_grievance_user', JSON.stringify(originalAdmin));
    setOriginalAdmin(null);
    localStorage.removeItem('honda_grievance_original_admin');
  };

  // Direct return to Super Admin console
  const switchBackToSuperAdmin = () => {
    switchToSuperAdmin();
  };

  const logout = () => {
    setUser(null);
    setOriginalAdmin(null);
    setOriginalSuperAdmin(null);
    localStorage.removeItem('honda_grievance_user');
    localStorage.removeItem('honda_grievance_original_admin');
    localStorage.removeItem('honda_grievance_original_super_admin');
  };

  // --- Super Admin Account Management Functions ---

  // Create any user / ID
  const createUserAccount = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || 'Failed to create user account.');
      await fetchDirectory();
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Update any user / ID
  const updateUserAccount = async (id, updateData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || 'Failed to update user account.');
      await fetchDirectory();
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Enable / Disable user ID
  const toggleUserStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change account status.');
      await fetchDirectory();
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Delete user ID
  const deleteUserAccount = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || ''
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user account.');
      await fetchDirectory();
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Fetch live system stats
  const fetchSystemStats = async () => {
    try {
      const res = await fetch('/api/system/stats', {
        headers: {
          'x-user-id': user?.id || ''
        }
      });
      if (!res.ok) throw new Error('Failed to fetch system stats.');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const requestOtp = async (identifier) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || 'Failed to request verification code.');
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const resetPassword = async (identifier, otp, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, newPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || 'Password reset failed.');
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        originalAdmin,
        originalSuperAdmin,
        isSuperAdminUser,
        currentMode,
        directoryUsers,
        loading,
        error,
        login,
        logout,
        quickSwitchUser,
        switchToSuperAdmin,
        switchToAdminMode,
        switchToUserMode,
        switchBackToAdmin,
        switchBackToSuperAdmin,
        createUserAccount,
        updateUserAccount,
        toggleUserStatus,
        deleteUserAccount,
        fetchSystemStats,
        requestOtp,
        resetPassword,
        fetchDirectory
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
