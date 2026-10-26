import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const GrievanceContext = createContext(null);

export function GrievanceProvider({ children }) {
  const { user, currentMode } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('ALL');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Fetch grievances according to current user and active location tab
  const fetchGrievances = useCallback(async () => {
    if (!user) {
      setGrievances([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let url = '/api/grievances';
      const isEmployee = currentMode === 'employee' || user.role === 'employee';
      const isElevated = !isEmployee && (user.role === 'admin' || user.role === 'super_admin' || user.isSuperAdmin);
      const hasGlobalScope = !isEmployee && (user.role === 'super_admin' || user.isSuperAdmin || user.location === 'H.O' || user.isGlobalAdmin);
      if (isElevated && hasGlobalScope && selectedLocationFilter !== 'ALL') {
        url += `?location=${selectedLocationFilter}`;
      }
      const res = await fetch(url, {
        headers: {
          'x-user-id': user.id,
          'x-simulated-role': currentMode || user.role,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch grievances.');
      }
      const data = await res.json();
      setGrievances(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, currentMode, selectedLocationFilter]);

  // Fetch analytics stats
  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/analytics', {
        headers: { 'x-user-id': user.id },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchGrievances();
    fetchAnalytics();
  }, [fetchGrievances, fetchAnalytics]);

  // Submit new grievance
  const lodgeGrievance = async (payload) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit grievance.');
      
      // Update local state
      await fetchGrievances();
      await fetchAnalytics();
      setLoading(false);
      return data.grievance;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Update grievance (Status, remark, assignment, escalate)
  const updateGrievance = async (id, updatePayload) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const res = await fetch(`/api/grievances/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update grievance.');

      // Update state and active selection
      await fetchGrievances();
      await fetchAnalytics();
      if (selectedGrievance && selectedGrievance.id === id) {
        setSelectedGrievance(data.grievance);
      }
      return data.grievance;
    } catch (err) {
      throw err;
    }
  };

  // Add comment / remark
  const addComment = async (id, message, type = 'public') => {
    if (!user) throw new Error('Not authenticated');
    try {
      const res = await fetch(`/api/grievances/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ message, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add comment.');

      await fetchGrievances();
      if (selectedGrievance && selectedGrievance.id === id) {
        setSelectedGrievance(data.grievance);
      }
      return data.grievance;
    } catch (err) {
      throw err;
    }
  };

  // Permanently delete grievance ticket (Super Admin privilege)
  const deleteGrievanceTicket = async (id) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const res = await fetch(`/api/grievances/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete grievance ticket.');

      if (selectedGrievance && selectedGrievance.id === id) {
        setSelectedGrievance(null);
      }
      await fetchGrievances();
      await fetchAnalytics();
      return true;
    } catch (err) {
      throw err;
    }
  };

  // Full grievance update (Super Admin override on any field)
  const fullUpdateGrievanceTicket = async (id, updatePayload) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const res = await fetch(`/api/grievances/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update grievance ticket.');

      await fetchGrievances();
      await fetchAnalytics();
      if (selectedGrievance && selectedGrievance.id === id) {
        setSelectedGrievance(data.grievance);
      }
      return data.grievance;
    } catch (err) {
      throw err;
    }
  };

  return (
    <GrievanceContext.Provider
      value={{
        grievances,
        loading,
        error,
        selectedLocationFilter,
        setSelectedLocationFilter,
        selectedGrievance,
        setSelectedGrievance,
        analytics,
        fetchGrievances,
        fetchAnalytics,
        lodgeGrievance,
        updateGrievance,
        deleteGrievanceTicket,
        fullUpdateGrievanceTicket,
        addComment,
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
}

export function useGrievances() {
  const context = useContext(GrievanceContext);
  if (!context) {
    throw new Error('useGrievances must be used within a GrievanceProvider');
  }
  return context;
}
