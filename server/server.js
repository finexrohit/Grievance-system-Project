import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDB,
  resetDB,
  findUserByCredentials,
  findUserByIdentifier,
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  setUserStatus,
  deleteUser,
  deleteGrievance,
  fullUpdateGrievance,
  getSystemStats,
  updateUserPassword,
  getGrievancesForUser,
  getGrievanceById,
  createGrievance,
  updateGrievance,
  addGrievanceComment,
  getAnalytics,
  getGrievanceRegistry,
  setOTP,
  getOTP,
  deleteOTP
} from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Serve built frontend if present
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Initialize MySQL database on server start
initDB();

// Helper to extract user from header
async function getRequestUser(req) {
  const userId = req.headers['x-user-id'];
  if (!userId) return null;
  const u = await getUserById(userId);
  if (u && (u.status === 'Disabled' || u.status === 'Inactive')) {
    return null; // Reject disabled IDs
  }
  const simulatedRole = req.headers['x-simulated-role'];
  if (simulatedRole && (u.isSuperAdmin || u.role === 'super_admin' || u.role === 'admin')) {
    return {
      ...u,
      role: simulatedRole,
      isSuperAdmin: simulatedRole === 'super_admin',
      isGlobalAdmin: simulatedRole === 'super_admin' || (simulatedRole === 'admin' && u.isGlobalAdmin)
    };
  }
  return u;
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter both Employee ID / Email and Password.' });
    }

    const result = await findUserByCredentials(identifier, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid Employee ID, Email, or Password. Please check credentials.' });
    }

    if (result.accountDisabled) {
      return res.status(403).json({ error: 'This account has been disabled by the Super Administrator. Access denied.' });
    }

    const user = result;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Forgot Password - Request OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Please provide your Employee ID or Registered Email.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ error: 'No employee or administrator found with the given ID/Email.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await setOTP(user.empId, otp, user.email, user.empId, expiresAt);
    await setOTP(user.email, otp, user.email, user.empId, expiresAt);

    return res.json({
      success: true,
      message: `Verification code generated for ${user.name} (${user.email}).`,
      email: user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length)),
      empId: user.empId,
      demoOtp: otp
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Error generating recovery code.' });
  }
});

// Reset Password - Verify OTP & Set New Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: 'Identifier, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const record = await getOTP(identifier);

    if (!record || record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid or expired OTP code. Please request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' });
    }

    const updated = await updateUserPassword(identifier, newPassword);
    if (!updated) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    // Clean up OTP
    await deleteOTP(identifier);
    if (record.email) await deleteOTP(record.email);
    if (record.empId) await deleteOTP(record.empId);

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Error updating password.' });
  }
});

// -------------------------------------------------------------
// USER DIRECTORY ROUTES
// -------------------------------------------------------------

// Get all users (for directory & demo switcher)
app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    return res.status(500).json({ error: 'Failed to fetch directory.' });
  }
});

// Get single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json(user);
  } catch (err) {
    console.error('Fetch single user error:', err);
    return res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// Create new user (Employee, Admin, or Super Admin) in MySQL
app.post('/api/users', async (req, res) => {
  try {
    const { empId, name, email, password, role, designation, department, location, phone, avatar, status } = req.body;
    if (!empId || !name || !email || !password) {
      return res.status(400).json({ error: 'Employee ID, Name, Email, and Password are required.' });
    }

    const existing = await findUserByIdentifier(empId) || await findUserByIdentifier(email);
    if (existing) {
      return res.status(400).json({ error: 'A user with this Employee ID or Email already exists in the database.' });
    }

    const newUser = await createUser({
      empId,
      name,
      email,
      password,
      role: role || 'employee',
      designation: designation || 'Associate',
      department: department || 'General Operations',
      location: location || '1F',
      phone: phone || null,
      avatar: avatar || null,
      status: status || 'Active',
      isGlobalAdmin: role === 'super_admin' || location === 'H.O',
      isSuperAdmin: role === 'super_admin'
    });

    return res.status(201).json({
      success: true,
      message: `User ${name} (${empId}) registered successfully in MySQL database.`,
      user: newUser
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Failed to create user record.' });
  }
});

// Update user details (Super Admin override or self-profile)
app.put('/api/users/:id', async (req, res) => {
  try {
    const requestingUser = await getRequestUser(req);
    // Allow if super admin, or user updating self
    if (requestingUser && (requestingUser.role !== 'super_admin' && !requestingUser.isSuperAdmin && requestingUser.id !== req.params.id)) {
      return res.status(403).json({ error: 'Only Super Administrators can modify other associate accounts.' });
    }

    const updated = await updateUser(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    return res.json({
      success: true,
      message: `User ${updated.name} updated successfully in database.`,
      user: updated
    });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update user.' });
  }
});

// Enable / Disable user account (Super Admin action)
app.patch('/api/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || (status !== 'Active' && status !== 'Disabled')) {
      return res.status(400).json({ error: 'Status must be Active or Disabled.' });
    }

    const targetUser = await getUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if ((targetUser.empId === 'HND-SPRADM-001' || targetUser.role === 'super_admin') && status === 'Disabled') {
      return res.status(400).json({ error: 'The Root Super Administrator account cannot be disabled.' });
    }

    const updated = await setUserStatus(req.params.id, status);
    return res.json({
      success: true,
      message: `Account ${updated.name} (${updated.empId}) has been set to ${status}.`,
      user: updated
    });
  } catch (err) {
    console.error('Set status error:', err);
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// Delete user account (Super Admin privilege)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const requestingUser = await getRequestUser(req);
    if (requestingUser && requestingUser.role !== 'super_admin' && !requestingUser.isSuperAdmin) {
      return res.status(403).json({ error: 'Only Super Administrators can delete associate IDs.' });
    }

    await deleteUser(req.params.id);
    return res.json({
      success: true,
      message: 'User account deleted successfully from database.'
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(400).json({ error: err.message || 'Failed to delete user.' });
  }
});

// -------------------------------------------------------------
// GRIEVANCE ROUTES
// -------------------------------------------------------------

// List grievances for active user
app.get('/api/grievances', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required. Missing or invalid x-user-id header.' });
    }

    const locationFilter = req.query.location || null;
    const grievances = await getGrievancesForUser(user, locationFilter);
    return res.json(grievances);
  } catch (err) {
    console.error('Get grievances error:', err);
    return res.status(500).json({ error: 'Failed to fetch grievances.' });
  }
});

// Get single grievance
app.get('/api/grievances/:id', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const grievance = await getGrievanceById(req.params.id, user);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found or unauthorized.' });
    }

    return res.json(grievance);
  } catch (err) {
    console.error('Get single grievance error:', err);
    return res.status(500).json({ error: 'Failed to fetch grievance details.' });
  }
});

// Submit new grievance (Employees)
app.post('/api/grievances', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { title, category, description, priority, location, specificArea, attachmentUrl, attachmentName, isAnonymous } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Title, category, and description are required fields.' });
    }

    const created = await createGrievance({
      title,
      category,
      description,
      priority: priority || 'Medium',
      location: location || user.location,
      specificArea,
      attachmentUrl,
      attachmentName,
      isAnonymous: !!isAnonymous
    }, user);

    return res.status(201).json({
      success: true,
      message: `Grievance ticket ${created.ticketNumber} lodged successfully and stored in MySQL database.`,
      grievance: created
    });
  } catch (err) {
    console.error('Create grievance error:', err);
    return res.status(500).json({ error: 'Failed to lodge grievance.' });
  }
});

// Update grievance (Admins & Super Admin)
app.patch('/api/grievances/:id', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (user.role !== 'admin' && user.role !== 'super_admin' && !user.isSuperAdmin) {
      return res.status(403).json({ error: 'Only associate admins or super administrators have permission to update grievance status.' });
    }

    const updated = await updateGrievance(req.params.id, req.body, user);
    if (!updated) {
      return res.status(404).json({ error: 'Grievance not found.' });
    }

    return res.json({
      success: true,
      message: 'Grievance updated successfully.',
      grievance: updated
    });
  } catch (err) {
    console.error('Update grievance error:', err);
    return res.status(400).json({ error: err.message || 'Failed to update grievance.' });
  }
});

// Full Grievance Update (Super Admin override on any field)
app.put('/api/grievances/:id', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'super_admin' && !user.isSuperAdmin) {
      return res.status(403).json({ error: 'Only Super Administrators can modify all grievance attributes.' });
    }

    const updated = await fullUpdateGrievance(req.params.id, req.body, user);
    if (!updated) return res.status(404).json({ error: 'Grievance not found.' });

    return res.json({
      success: true,
      message: 'Grievance ticket modified successfully by Super Administrator.',
      grievance: updated
    });
  } catch (err) {
    console.error('Full update grievance error:', err);
    return res.status(400).json({ error: err.message || 'Failed to update grievance.' });
  }
});

// Delete Grievance Ticket (Super Admin)
app.delete('/api/grievances/:id', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'super_admin' && !user.isSuperAdmin) {
      return res.status(403).json({ error: 'Only Super Administrators can permanently delete grievance tickets.' });
    }

    await deleteGrievance(req.params.id);
    return res.json({
      success: true,
      message: 'Grievance ticket permanently purged from database.'
    });
  } catch (err) {
    console.error('Delete grievance error:', err);
    return res.status(500).json({ error: 'Failed to delete grievance ticket.' });
  }
});

// System & Database Stats (Super Admin)
app.get('/api/system/stats', async (req, res) => {
  try {
    const stats = await getSystemStats();
    return res.json(stats);
  } catch (err) {
    console.error('System stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch system stats.' });
  }
});

// Add comment/remark
app.post('/api/grievances/:id/comments', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { message, type } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const updated = await addGrievanceComment(req.params.id, message, user, type || 'public');
    if (!updated) {
      return res.status(404).json({ error: 'Grievance not found.' });
    }

    return res.json({
      success: true,
      message: 'Comment added.',
      grievance: updated
    });
  } catch (err) {
    console.error('Add comment error:', err);
    return res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// -------------------------------------------------------------
// ANALYTICS ROUTE
// -------------------------------------------------------------

app.get('/api/analytics', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const stats = await getAnalytics(user);
    return res.json(stats);
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Failed to calculate analytics.' });
  }
});

// -------------------------------------------------------------
// GRIEVANCE REGISTRY ROUTE (Sender & Receiver Audit Trail)
// -------------------------------------------------------------

app.get('/api/grievance-registry', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const locationFilter = req.query.location || null;
    const records = await getGrievanceRegistry(user, locationFilter);
    return res.json(records);
  } catch (err) {
    console.error('Registry fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch grievance registry.' });
  }
});

// -------------------------------------------------------------
// SYSTEM RESET
// -------------------------------------------------------------

app.post('/api/system/reset', async (req, res) => {
  try {
    const data = await resetDB();
    return res.json({
      success: true,
      message: 'System database restored to default seed state in MySQL.',
      userCount: data.users.length,
      grievanceCount: data.grievances.length
    });
  } catch (err) {
    console.error('Reset error:', err);
    return res.status(500).json({ error: 'Failed to reset database.' });
  }
});

// Catch-all route to serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Honda Grievance Management System Backend (MySQL)`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Location Routing Active: H.O | 1F | 2F | 3F | 4F`);
  console.log(`====================================================`);
});
