import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Shield,
  Search,
  Building2,
  Factory,
  Mail,
  Phone,
  Calendar,
  Filter,
  KeyRound,
  UserPlus,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Crown,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Table,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';
import LocationBadge from '../components/LocationBadge';

export default function DirectoryPage() {
  const {
    user,
    directoryUsers,
    quickSwitchUser,
    isSuperAdminUser,
    currentMode,
    createUserAccount,
    updateUserAccount,
    toggleUserStatus,
    deleteUserAccount
  } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Layout view: 'grid' | 'table'
  const [viewLayout, setViewLayout] = useState('grid');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Create form state
  const [createForm, setCreateForm] = useState({
    empId: '',
    name: '',
    email: '',
    password: 'honda@password123',
    role: 'admin',
    location: '1F',
    department: 'Plant Operations & Grievance Cell',
    designation: 'Plant 1 Associate Admin',
    phone: '',
    status: 'Active'
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    empId: '',
    name: '',
    email: '',
    password: '',
    role: 'employee',
    location: '1F',
    department: '',
    designation: '',
    phone: '',
    status: 'Active'
  });

  const locations = ['ALL', 'H.O', '1F', '2F', '3F', '4F'];

  const isSuperAdmin = !!(
    user?.role === 'super_admin' ||
    user?.isSuperAdmin ||
    user?.empId === 'HND-SPRADM-001' ||
    (isSuperAdminUser && currentMode === 'super_admin')
  );

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredUsers = directoryUsers.filter(u => {
    const matchesLoc = selectedLocation === 'ALL' || u.location === selectedLocation;
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'Active' ? (u.status === 'Active' || !u.status) : u.status === 'Disabled');
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.empId.toLowerCase().includes(search.toLowerCase()) ||
      (u.designation && u.designation.toLowerCase().includes(search.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.phone && u.phone.includes(search));

    return matchesLoc && matchesRole && matchesStatus && matchesSearch;
  });

  const superAdminsCount = directoryUsers.filter(u => u.role === 'super_admin' || u.isSuperAdmin).length;
  const adminsCount = directoryUsers.filter(u => u.role === 'admin' && !u.isSuperAdmin).length;
  const employeesCount = directoryUsers.filter(u => u.role === 'employee').length;
  const disabledCount = directoryUsers.filter(u => u.status === 'Disabled').length;

  // Handle Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (!createForm.empId || !createForm.name || !createForm.email || !createForm.password) {
        throw new Error('Please fill all mandatory fields (Emp ID, Name, Email, Password).');
      }
      await createUserAccount(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        empId: '',
        name: '',
        email: '',
        password: 'honda@password123',
        role: 'employee',
        location: '1F',
        department: 'General Operations',
        designation: 'Associate',
        phone: '',
        status: 'Active'
      });
      alert(`User ID ${createForm.empId} successfully registered in database.`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setEditForm({
      empId: targetUser.empId || '',
      name: targetUser.name || '',
      email: targetUser.email || '',
      password: targetUser.plainPassword || targetUser.password || 'honda@password123',
      role: targetUser.role || 'employee',
      location: targetUser.location || '1F',
      department: targetUser.department || '',
      designation: targetUser.designation || '',
      phone: targetUser.phone || '',
      status: targetUser.status || 'Active'
    });
    setShowEditPassword(false);
    setFormError('');
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (!editForm.empId || !editForm.name || !editForm.email) {
        throw new Error('Please fill all mandatory fields (Emp ID, Name, Email).');
      }
      await updateUserAccount(editingUser.id, editForm);
      setEditingUser(null);
      alert(`User record ${editForm.empId || editingUser.empId} updated successfully.`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Toggle Status (Disable / Enable)
  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'Disabled' ? 'Active' : 'Disabled';
    const confirmMsg = targetUser.status === 'Disabled'
      ? `Re-enable account for ${targetUser.name} (${targetUser.empId})? They will regain portal access.`
      : `Disable account for ${targetUser.name} (${targetUser.empId})? This will immediately revoke login access.`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleUserStatus(targetUser.id, newStatus);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${targetUser.name} (${targetUser.empId}) from MySQL? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteUserAccount(targetUser.id);
      alert(`User ${targetUser.empId} removed from database.`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 space-y-3">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-red-600" />
                HONDA ASSOCIATE &amp; ID ROSTER
              </span>
              {isSuperAdmin && (
                <span className="text-[10px] font-mono font-extrabold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <Crown className="w-3 h-3 text-purple-600" /> SUPER ADMIN CONTROL ACTIVE
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Organizational Personnel &amp; ID Management
            </h1>
            <p className="text-xs text-slate-600 font-medium max-w-2xl">
              Directory of associate admins and plant employees across all 5 operational facilities (H.O, 1F, 2F, 3F, 4F).
              {isSuperAdmin && ' Super Administrators can register new accounts, disable/enable any ID, and modify database records.'}
            </p>
          </div>

          {/* Action button for Super Admin / Admin */}
          {(isSuperAdmin || user.role === 'admin') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all shrink-0 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New User ID</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, employee ID, designation, department, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white"
            />
          </div>

          {/* Role & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setSelectedRole('ALL')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedRole === 'ALL'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({directoryUsers.length})
              </button>
              {superAdminsCount > 0 && (
                <button
                  onClick={() => setSelectedRole('super_admin')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                    selectedRole === 'super_admin'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  Super ({superAdminsCount})
                </button>
              )}
              <button
                onClick={() => setSelectedRole('admin')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3 h-3" />
                Admins ({adminsCount})
              </button>
              <button
                onClick={() => setSelectedRole('employee')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedRole === 'employee'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Associates ({employeesCount})
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'ALL'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setSelectedStatus('Active')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  selectedStatus === 'Active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                Active ({directoryUsers.length - disabledCount})
              </button>
              <button
                onClick={() => setSelectedStatus('Disabled')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  selectedStatus === 'Disabled'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3 h-3 text-rose-300" />
                Disabled ({disabledCount})
              </button>
            </div>

            {/* View Layout Switcher */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewLayout === 'grid'
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid cards layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('table')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewLayout === 'table'
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Credentials Vault table view"
              >
                <Table className="w-3.5 h-3.5" />
                <span>ID &amp; Password Vault</span>
              </button>
            </div>
          </div>

        </div>

        {/* Location Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-red-600" /> Facility:
          </span>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedLocation === loc
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {loc === 'ALL' ? 'All Facilities' : loc}
            </button>
          ))}
        </div>

        {/* --- VIEW: CREDENTIALS VAULT TABLE --- */}
        {viewLayout === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs mt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Associate &amp; Role</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Employee ID (Login ID)</th>
                  {isSuperAdmin && <th className="py-3 px-4">Password (Login Pass)</th>}
                  <th className="py-3 px-4">Email &amp; Contact</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.map((u) => {
                  const isDisabled = u.status === 'Disabled';
                  const isSuper = u.role === 'super_admin' || u.isSuperAdmin;
                  const displayPass = u.plainPassword || u.password || 'honda@password123';

                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${isDisabled ? 'bg-rose-50/30' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSuper ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                            u.role === 'admin' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {isSuper ? <Crown className="w-4 h-4 text-amber-500" /> : u.role === 'admin' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className={`font-bold ${isDisabled ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{u.name}</p>
                            <p className="text-[11px] text-slate-500">{u.designation || 'Associate'} • {u.department || 'Operations'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <LocationBadge location={u.location} isHOGlobal={u.isGlobalAdmin} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                          <span className="font-mono font-bold text-red-700">{u.empId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.empId, `tbl-id-${u.id}`)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                            title="Copy ID"
                          >
                            {copiedKey === `tbl-id-${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                            <span className="font-mono text-slate-800 font-semibold">
                              {visiblePasswords[u.id] ? displayPass : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title={visiblePasswords[u.id] ? "Hide password" : "Show password"}
                            >
                              {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5 text-slate-600" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(displayPass, `tbl-pass-${u.id}`)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title="Copy password"
                            >
                              {copiedKey === `tbl-pass-${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="py-3.5 px-4">
                        <p className="text-[11px] text-slate-600 font-medium">{u.email}</p>
                        {u.phone && <p className="text-[10px] text-slate-400 font-mono">{u.phone}</p>}
                      </td>
                      <td className="py-3.5 px-4">
                        {isDisabled ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-1 uppercase">
                            <Lock className="w-2.5 h-2.5" /> Disabled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuperAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                disabled={u.empId === 'HND-SPRADM-001'}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 border transition-all ${
                                  isDisabled
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-300'
                                } ${u.empId === 'HND-SPRADM-001' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={isDisabled ? 'Enable user account' : 'Disable user account'}
                              >
                                {isDisabled ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                <span>{isDisabled ? 'Enable' : 'Disable'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditModal(u)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all inline-flex items-center gap-1 border border-slate-300 cursor-pointer"
                                title="Change ID, password, role & details"
                              >
                                <Edit3 className="w-3 h-3 text-slate-500" />
                                <span>Change</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => quickSwitchUser(u)}
                            disabled={isDisabled}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all inline-flex items-center gap-1 border ${
                              isDisabled
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : 'bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white border-slate-200 cursor-pointer'
                            }`}
                            title={isDisabled ? 'Account disabled' : 'Login as this user'}
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Login</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* --- VIEW: PERSONNEL GRID CARDS --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredUsers.map((u) => {
              const isDisabled = u.status === 'Disabled';
              const isSuper = u.role === 'super_admin' || u.isSuperAdmin;
              const displayPass = u.plainPassword || u.password || 'honda@password123';

              return (
                <div
                  key={u.id}
                  className={`bg-white rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-xs border ${
                    isDisabled
                      ? 'border-rose-300 bg-rose-50/20'
                      : isSuper
                      ? 'border-purple-300 hover:border-purple-400 bg-purple-50/10'
                      : 'border-slate-200 hover:border-red-400/60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {u.empId}
                        </span>
                        <LocationBadge location={u.location} isHOGlobal={u.isGlobalAdmin} size="sm" />
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Status Badge */}
                        {isDisabled ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 uppercase">
                            <Lock className="w-2.5 h-2.5" /> Disabled
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Active
                          </span>
                        )}

                        {/* Role Badge */}
                        {isSuper ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1 uppercase">
                            <Crown className="w-2.5 h-2.5 text-amber-500" /> Super
                          </span>
                        ) : u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Associate
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className={`text-sm font-bold transition-colors ${
                      isDisabled ? 'text-slate-500 line-through' : isSuper ? 'text-purple-950 font-black' : 'text-slate-900 group-hover:text-red-600'
                    }`}>
                      {u.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{u.designation || 'Associate'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{u.department || 'General Operations'}</p>

                    {/* SUPER ADMIN CREDENTIALS BOX ON CARD */}
                    {isSuperAdmin && (
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-semibold flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-red-600" /> Login ID:
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-red-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {u.empId}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(u.empId, `card-id-${u.id}`)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title="Copy ID"
                            >
                              {copiedKey === `card-id-${u.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-semibold flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-600" /> Password:
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {visiblePasswords[u.id] ? displayPass : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title={visiblePasswords[u.id] ? "Hide password" : "Show password"}
                            >
                              {visiblePasswords[u.id] ? <EyeOff className="w-3 h-3 text-slate-600" /> : <Eye className="w-3 h-3 text-slate-600" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(displayPass, `card-pass-${u.id}`)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title="Copy password"
                            >
                              {copiedKey === `card-pass-${u.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{u.phone}</span>
                      </div>
                    )}

                    {/* Control Actions */}
                    {isSuperAdmin ? (
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          {/* Toggle Status Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={u.empId === 'HND-SPRADM-001'}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all border ${
                              isDisabled
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-300'
                            } ${u.empId === 'HND-SPRADM-001' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={isDisabled ? 'Enable user account' : 'Disable user account'}
                          >
                            {isDisabled ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{isDisabled ? 'Enable ID' : 'Disable ID'}</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all flex items-center gap-1 border border-slate-300 cursor-pointer"
                            title="Change ID, password, role & details"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Change</span>
                          </button>

                          {/* Delete Button */}
                          {u.empId !== 'HND-SPRADM-001' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] transition-all border border-rose-200 cursor-pointer"
                              title="Delete user from database"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Login As Demo Switcher */}
                        <button
                          type="button"
                          onClick={() => quickSwitchUser(u)}
                          disabled={isDisabled}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 border ${
                            isDisabled
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white border-slate-200 cursor-pointer'
                          }`}
                          title={isDisabled ? 'Account disabled — cannot login' : 'Login as this user'}
                        >
                          <KeyRound className="w-2.5 h-2.5" />
                          <span>Login As</span>
                        </button>
                      </div>
                    ) : (
                      /* Regular Admin View */
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[10px] text-slate-400">
                          Default: <strong className="font-mono text-slate-600">honda@password123</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => quickSwitchUser(u)}
                          disabled={isDisabled}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 border ${
                            isDisabled
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white border-slate-200 cursor-pointer'
                          }`}
                          title={isDisabled ? 'Account disabled' : 'Login as this user'}
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Login As</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* --- CREATE USER MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Register New User ID</h3>
                  <p className="text-xs text-slate-500">Create an associate, plant admin, or super admin account in MySQL.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HND-1F-301"
                    value={createForm.empId}
                    onChange={(e) => setCreateForm({ ...createForm, empId: e.target.value.trim().toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Kumar"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rohit.kumar@honda.co.in"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value.trim().toLowerCase() })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Password *</label>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      placeholder="e.g. honda@password123"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-10 py-2 font-mono focus:bg-white focus:border-red-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showCreatePassword ? "Hide password" : "Show password"}
                    >
                      {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  >
                    <option value="employee">Associate (Employee)</option>
                    <option value="admin">Plant Admin</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plant Location *</label>
                  <select
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  >
                    <option value="H.O">H.O (Corporate Head Office)</option>
                    <option value="1F">1F (Plant 1)</option>
                    <option value="2F">2F (Plant 2)</option>
                    <option value="3F">3F (Plant 3)</option>
                    <option value="4F">4F (Plant 4)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Paint Shop / HR"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Assembly Associate / Lead"
                    value={createForm.designation}
                    onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 98..."
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-sm"
                >
                  {formLoading ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Edit User ID: <span className="font-mono text-purple-700">{editingUser.empId}</span>
                  </h3>
                  <p className="text-xs text-slate-500">Super Administrator override for account record.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Employee ID and Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Employee ID (Login ID / Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.empId}
                    onChange={(e) => setEditForm({ ...editForm, empId: e.target.value.trim().toUpperCase() })}
                    disabled={editingUser.empId === 'HND-SPRADM-001'}
                    className={`w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:border-red-600 outline-none uppercase ${
                      editingUser.empId === 'HND-SPRADM-001' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                  {editingUser.empId === 'HND-SPRADM-001' && (
                    <p className="text-[10px] text-slate-400 mt-0.5">Root Super Admin ID is permanent.</p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Password (Login Pass) *
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-10 py-2 font-mono text-slate-900 focus:bg-white focus:border-red-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showEditPassword ? 'Hide password' : 'Show password'}
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value.trim().toLowerCase() })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      let updatedDesig = editForm.designation;
                      if (newRole === 'employee' && (!editForm.designation || editForm.designation.includes('Admin') || editForm.designation.includes('Administrator'))) {
                        updatedDesig = 'Associate';
                      } else if (newRole === 'admin' && (!editForm.designation || editForm.designation === 'Associate' || editForm.designation.includes('Chief Super'))) {
                        updatedDesig = `${editForm.location} Associate Admin`;
                      } else if (newRole === 'super_admin' && (!editForm.designation || editForm.designation === 'Associate' || editForm.designation.includes('Plant'))) {
                        updatedDesig = 'Chief Super Administrator';
                      }
                      setEditForm({ ...editForm, role: newRole, designation: updatedDesig });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  >
                    <option value="employee">Associate</option>
                    <option value="admin">Plant Admin</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facility Location</label>
                  <select
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  >
                    <option value="H.O">H.O</option>
                    <option value="1F">1F</option>
                    <option value="2F">2F</option>
                    <option value="3F">3F</option>
                    <option value="4F">4F</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    disabled={editingUser.empId === 'HND-SPRADM-001'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-sm"
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
