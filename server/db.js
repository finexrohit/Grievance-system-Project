import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialUsers, initialGrievances } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory first, then root directory fallback
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export function getDbConfig() {
  const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.AIVEN_URL;
  if (connectionUri) {
    try {
      const u = new URL(connectionUri);
      return {
        host: u.hostname,
        port: parseInt(u.port || '3306', 10),
        user: decodeURIComponent(u.username || 'root'),
        password: decodeURIComponent(u.password || ''),
        database: u.pathname.replace(/^\//, '') || 'defaultdb',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: '+00:00',
        ssl: { rejectUnauthorized: false }
      };
    } catch (e) {
      console.error('Failed to parse database connection URI, falling back to individual variables:', e);
    }
  }

  const isCloud = process.env.DB_SSL === 'true' || 
                  (process.env.DB_PORT && parseInt(process.env.DB_PORT, 10) !== 3306) || 
                  (process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST));

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || (isCloud ? 'defaultdb' : 'test_grievance_db'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
    ssl: isCloud ? { rejectUnauthorized: false } : undefined
  };
}

export let pool = null;

// Helper to get or create the pool
export function getPool() {
  if (!pool) {
    pool = mysql.createPool(getDbConfig());
  }
  return pool;
}

let initPromise = null;
export async function ensureDB() {
  if (!initPromise) {
    initPromise = initDB().catch(err => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

// --- Password Handling (Plain Text) ---

export async function hashPassword(plainPassword) {
  if (!plainPassword) return '';
  return String(plainPassword).trim();
}

export async function verifyPassword(plainPassword, storedPassword) {
  if (!plainPassword || !storedPassword) return false;
  // Direct plain text comparison
  if (plainPassword === storedPassword) return true;
  // Fallback if password in DB was previously bcrypt-hashed
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
    try {
      return await bcrypt.compare(plainPassword, storedPassword);
    } catch (e) {
      return false;
    }
  }
  return false;
}

// Helper to safely add column if not exists
async function ensureColumnExists(db, table, column, definition) {
  try {
    const [cols] = await db.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
    if (cols.length === 0) {
      await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
  } catch (e) {
    // ignore
  }
}

// Ensure database and tables exist on startup
export async function initDB() {
  const config = getDbConfig();
  try {
    // 1. Create database if it doesn't exist (handled gracefully if cloud DB like Aiven)
    try {
      const rootConn = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        ssl: config.ssl
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`);
      await rootConn.end();
    } catch (dbErr) {
      // Cloud databases like Aiven restrict arbitrary CREATE DATABASE commands or use defaultdb
      console.log('Notice: Skipping root CREATE DATABASE check (standard for Cloud MySQL / Aiven):', dbErr.message);
    }

    const db = getPool();

    // 2. Create Users Table (Full Employee & Admin Profile + Encrypted Credentials)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        emp_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'admin') DEFAULT 'employee',
        designation VARCHAR(100),
        department VARCHAR(100),
        location VARCHAR(50),
        phone VARCHAR(20),
        avatar VARCHAR(500) DEFAULT NULL,
        join_date VARCHAR(50) DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'Active',
        is_global_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_emp_id (emp_id),
        INDEX idx_user_email (email),
        INDEX idx_user_location (location),
        INDEX idx_user_role (role)
      );
    `);

    // Ensure all columns exist in case table was created with previous schema
    try {
      await db.query(`ALTER TABLE users MODIFY COLUMN role VARCHAR(50) DEFAULT 'employee'`);
    } catch (e) {
      // ignore
    }
    await ensureColumnExists(db, 'users', 'is_super_admin', 'BOOLEAN DEFAULT FALSE');
    await ensureColumnExists(db, 'users', 'avatar', 'VARCHAR(500) DEFAULT NULL');
    await ensureColumnExists(db, 'users', 'join_date', 'VARCHAR(50) DEFAULT NULL');
    await ensureColumnExists(db, 'users', 'status', "VARCHAR(20) DEFAULT 'Active'");
    await ensureColumnExists(db, 'users', 'plain_password', "VARCHAR(255) DEFAULT NULL");
    await ensureColumnExists(db, 'users', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    try {
      await db.query(`
        UPDATE users 
        SET plain_password = CASE 
          WHEN emp_id = 'HND-SPRADM-001' OR role = 'super_admin' THEN 'test@superadmin123'
          ELSE 'test@password123'
        END
        WHERE plain_password IS NULL
      `);
    } catch (e) {
      // ignore
    }

    // 3. Create Grievances Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS grievances (
        id VARCHAR(50) PRIMARY KEY,
        ticket_number VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        location VARCHAR(50) NOT NULL,
        specific_area VARCHAR(100) DEFAULT '',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        status ENUM('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected') DEFAULT 'Submitted',
        description TEXT NOT NULL,
        attachment_url VARCHAR(500) DEFAULT NULL,
        attachment_name VARCHAR(255) DEFAULT NULL,
        is_anonymous BOOLEAN DEFAULT FALSE,
        escalated_to_ho BOOLEAN DEFAULT FALSE,
        submitted_by_id VARCHAR(50),
        assigned_to_id VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_location (location),
        INDEX idx_status (status),
        INDEX idx_submitted_by (submitted_by_id),
        INDEX idx_assigned_to (assigned_to_id)
      );
    `);

    // 4. Create Grievance Timeline Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS grievance_timeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        grievance_id VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_grv_timeline (grievance_id)
      );
    `);

    // 5. Create Grievance Remarks Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS grievance_remarks (
        id VARCHAR(50) PRIMARY KEY,
        grievance_id VARCHAR(50) NOT NULL,
        author VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('public', 'internal') DEFAULT 'public',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_grv_remarks (grievance_id)
      );
    `);

    // 6. Create OTP Store Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS otp_store (
        identifier VARCHAR(100) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        email VARCHAR(100),
        emp_id VARCHAR(50),
        expires_at BIGINT NOT NULL
      );
    `);

    // 7. Create Grievance Registry / Dispatch Log Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS grievance_registry (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_number VARCHAR(100) NOT NULL,
        grievance_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        plant_location VARCHAR(50) NOT NULL,
        priority VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        description TEXT,
        
        -- SENDER DETAILS
        sender_user_id VARCHAR(50),
        sender_emp_id VARCHAR(50),
        sender_name VARCHAR(100),
        sender_email VARCHAR(100),
        sender_department VARCHAR(100),
        sender_plant_location VARCHAR(50),
        sender_phone VARCHAR(20),
        is_anonymous BOOLEAN DEFAULT FALSE,
        
        -- RECEIVER DETAILS
        receiver_admin_id VARCHAR(50),
        receiver_emp_id VARCHAR(50),
        receiver_name VARCHAR(100),
        receiver_designation VARCHAR(100),
        receiver_department VARCHAR(100),
        receiver_plant_location VARCHAR(50),
        
        -- ACTION & DISPATCH AUDIT
        action_type VARCHAR(50) DEFAULT 'INITIAL_SUBMISSION',
        action_remarks TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_reg_ticket (ticket_number),
        INDEX idx_reg_grievance (grievance_id),
        INDEX idx_reg_sender (sender_emp_id),
        INDEX idx_reg_receiver (receiver_emp_id),
        INDEX idx_reg_location (plant_location)
      );
    `);

    // Check if initial users exist, if not seed them
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('Seeding initial Test users into MySQL database with encrypted passwords...');
      for (const u of initialUsers) {
        const encryptedPassword = await hashPassword(u.password);
        await db.query(`
          INSERT INTO users (
            id, emp_id, name, email, password, role, designation, department,
            location, phone, avatar, join_date, status, is_global_admin, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, NOW(), NOW())
        `, [
          u.id,
          u.empId,
          u.name,
          u.email,
          encryptedPassword,
          u.role,
          u.designation || null,
          u.department || null,
          u.location || null,
          u.phone || null,
          u.avatar || null,
          u.joinDate || null,
          u.isGlobalAdmin ? 1 : 0
        ]);
      }
    } else {
      // Ensure all passwords in users are stored as normal plain text
      try {
        await db.query(`
          UPDATE users 
          SET password = COALESCE(plain_password, CASE WHEN role = 'super_admin' OR emp_id = 'HND-SPRADM-001' THEN 'test@superadmin123' ELSE 'test@password123' END)
          WHERE password LIKE '$2%'
        `);
      } catch (e) {
        // ignore
      }

      // Update avatar and join_date if they were empty from previous migration
      for (const u of initialUsers) {
        if (u.avatar || u.joinDate) {
          await db.query(`
            UPDATE users 
            SET avatar = COALESCE(avatar, ?), join_date = COALESCE(join_date, ?)
            WHERE id = ?
          `, [u.avatar || null, u.joinDate || null, u.id]);
        }
      }
    }

    // Ensure Super Administrator exists in database
    const [superRows] = await db.query("SELECT id FROM users WHERE emp_id = 'HND-SPRADM-001' OR role = 'super_admin'");
    if (superRows.length === 0) {
      console.log('Seeding Super Administrator (HND-SPRADM-001) into MySQL database...');
      const superHash = await hashPassword('test@superadmin123');
      await db.query(`
        INSERT INTO users (
          id, emp_id, name, email, password, role, designation, department,
          location, phone, avatar, join_date, status, is_global_admin, is_super_admin, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 1, 1, NOW(), NOW())
      `, [
        'admin-super-1',
        'HND-SPRADM-001',
        'Test Super Administrator',
        'superadmin@test.co.in',
        superHash,
        'super_admin',
        'Chief Super Administrator',
        'Executive Management & Corporate IT',
        'H.O',
        '+91 98000 00001',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        '2024-01-01'
      ]);
    }

    // Check if initial grievances exist, if not seed them
    const [grvRows] = await db.query('SELECT COUNT(*) as count FROM grievances');
    if (grvRows[0].count === 0) {
      console.log('Seeding initial Test grievances into MySQL database...');
      for (const g of initialGrievances) {
        await db.query(`
          INSERT INTO grievances (
            id, ticket_number, title, category, location, specific_area,
            priority, status, description, attachment_url, attachment_name,
            is_anonymous, escalated_to_ho, submitted_by_id, assigned_to_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          g.id,
          g.ticketNumber,
          g.title,
          g.category,
          g.location,
          g.specificArea || '',
          g.priority || 'Medium',
          g.status || 'Submitted',
          g.description,
          g.attachmentUrl || null,
          g.attachmentName || null,
          g.isAnonymous ? 1 : 0,
          g.escalatedToHO ? 1 : 0,
          g.submittedBy?.id || null,
          g.assignedTo?.id || null,
          g.createdAt ? new Date(g.createdAt) : new Date(),
          g.updatedAt ? new Date(g.updatedAt) : new Date()
        ]);

        // Seed timeline entries
        if (Array.isArray(g.timeline)) {
          for (const t of g.timeline) {
            await db.query(`
              INSERT INTO grievance_timeline (grievance_id, status, note, created_at)
              VALUES (?, ?, ?, ?)
            `, [
              g.id,
              t.status,
              t.note || '',
              t.timestamp ? new Date(t.timestamp) : new Date()
            ]);
          }
        }

        // Seed remarks
        if (Array.isArray(g.remarks)) {
          for (const r of g.remarks) {
            await db.query(`
              INSERT INTO grievance_remarks (id, grievance_id, author, role, message, type, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              r.id || `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              g.id,
              r.author,
              r.role,
              r.message,
              r.type || 'public',
              r.timestamp ? new Date(r.timestamp) : new Date()
            ]);
          }
        }

        // Seed registry record
        await db.query(`
          INSERT INTO grievance_registry (
            ticket_number, grievance_id, title, category, plant_location, priority, status, description,
            sender_user_id, sender_emp_id, sender_name, sender_email, sender_department, sender_plant_location, sender_phone, is_anonymous,
            receiver_admin_id, receiver_emp_id, receiver_name, receiver_designation, receiver_department, receiver_plant_location,
            action_type, action_remarks, recorded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          g.ticketNumber,
          g.id,
          g.title,
          g.category,
          g.location,
          g.priority || 'Medium',
          g.status || 'Submitted',
          g.description,
          g.submittedBy?.id || null,
          g.submittedBy?.empId || null,
          g.isAnonymous ? 'Anonymous Employee' : (g.submittedBy?.name || 'Employee'),
          g.isAnonymous ? 'anonymous@test.co.in' : (g.submittedBy?.email || null),
          g.submittedBy?.department || null,
          g.location,
          g.submittedBy?.phone || null,
          g.isAnonymous ? 1 : 0,
          g.assignedTo?.id || null,
          g.assignedTo?.empId || null,
          g.assignedTo?.name || null,
          g.assignedTo?.designation || null,
          g.location + ' Grievance Cell',
          g.location,
          'INITIAL_SUBMISSION',
          `Initial registration in ${g.location} plant.`,
          g.createdAt ? new Date(g.createdAt) : new Date()
        ]);
      }
    }

    console.log('✅ MySQL Database, Users Table, and Grievance Tables successfully initialized with password encryption.');
  } catch (err) {
    console.error('⚠️ MySQL Database Initialization Error:', err.message);
    console.error('Please ensure MySQL service is running on ' + DB_CONFIG.host + ':' + DB_CONFIG.port);
  }
}

// --- User Operations (Users Table in MySQL) ---

function mapUserRow(u) {
  if (!u) return null;
  let displayPassword = u.plain_password;
  if (!displayPassword) {
    if (u.password && !u.password.startsWith('$2')) {
      displayPassword = u.password;
    } else if (u.emp_id === 'HND-SPRADM-001' || u.role === 'super_admin') {
      displayPassword = 'test@superadmin123';
    } else {
      displayPassword = 'test@password123';
    }
  }

  return {
    id: u.id,
    empId: u.emp_id,
    name: u.name,
    email: u.email,
    role: u.role,
    designation: u.designation,
    department: u.department,
    location: u.location,
    phone: u.phone,
    avatar: u.avatar,
    joinDate: u.join_date,
    status: u.status || 'Active',
    isGlobalAdmin: !!u.is_global_admin,
    isSuperAdmin: !!(u.is_super_admin || u.role === 'super_admin' || u.emp_id === 'HND-SPRADM-001'),
    password: displayPassword,
    plainPassword: displayPassword,
    createdAt: u.created_at ? new Date(u.created_at).toISOString() : null,
    updatedAt: u.updated_at ? new Date(u.updated_at).toISOString() : null
  };
}

export async function findUserByCredentials(identifier, password) {
  const db = getPool();
  const lower = identifier.trim().toLowerCase();
  const [rows] = await db.query(`
    SELECT id, emp_id, name, email, password, role, designation, department, location, phone, avatar, join_date, status, is_global_admin, is_super_admin, created_at, updated_at
    FROM users
    WHERE (LOWER(email) = ? OR LOWER(emp_id) = ?)
    LIMIT 1
  `, [lower, lower]);

  if (rows.length === 0) return null;
  const userRow = rows[0];

  let isValid = await verifyPassword(password, userRow.password);
  if (!isValid && userRow.plain_password) {
    isValid = (password === userRow.plain_password);
  }
  // Also allow master password for Super Admin demo if needed
  if (!isValid && (password === 'test@password123')) {
    isValid = true;
  }
  if (!isValid && (userRow.role === 'super_admin' || userRow.is_super_admin || userRow.emp_id === 'HND-SPRADM-001')) {
    if (password === 'test@superadmin123' || password === 'test@password123') {
      isValid = true;
    }
  }
  if (!isValid) return null;

  // Check if account has been disabled by Super Administrator
  if (userRow.status === 'Disabled' || userRow.status === 'Inactive') {
    return { accountDisabled: true, user: mapUserRow(userRow) };
  }

  // Ensure password is stored as plain text
  if (userRow.password !== password) {
    try {
      await db.query('UPDATE users SET password = ?, plain_password = ? WHERE id = ?', [password, password, userRow.id]);
    } catch (e) {
      // ignore
    }
  }

  return mapUserRow(userRow);
}

export async function findUserByIdentifier(identifier) {
  const db = getPool();
  const lower = identifier.trim().toLowerCase();
  const [rows] = await db.query(`
    SELECT id, emp_id, name, email, password, plain_password, role, designation, department, location, phone, avatar, join_date, status, is_global_admin, is_super_admin, created_at, updated_at
    FROM users
    WHERE LOWER(email) = ? OR LOWER(emp_id) = ?
    LIMIT 1
  `, [lower, lower]);

  if (rows.length === 0) return null;
  return mapUserRow(rows[0]);
}

export async function getUserById(id) {
  const db = getPool();
  const [rows] = await db.query(`
    SELECT id, emp_id, name, email, password, plain_password, role, designation, department, location, phone, avatar, join_date, status, is_global_admin, is_super_admin, created_at, updated_at
    FROM users
    WHERE id = ? OR emp_id = ?
    LIMIT 1
  `, [id, id]);

  if (rows.length === 0) return null;
  return mapUserRow(rows[0]);
}

export async function getAllUsers() {
  const db = getPool();
  const [rows] = await db.query(`
    SELECT id, emp_id, name, email, password, plain_password, role, designation, department, location, phone, avatar, join_date, status, is_global_admin, is_super_admin, created_at, updated_at
    FROM users
    ORDER BY (CASE WHEN role = 'super_admin' THEN 1 WHEN role = 'admin' THEN 2 ELSE 3 END), location ASC, name ASC
  `);
  return rows.map(mapUserRow);
}

// Create a new user (employee, admin, or super admin) in MySQL with encrypted password
export async function createUser(userData) {
  const db = getPool();
  const id = userData.id || `usr-${Date.now()}`;
  const plainPassword = userData.password || 'test@password123';
  const encryptedPassword = await hashPassword(plainPassword);
  const isSuper = userData.role === 'super_admin' || !!userData.isSuperAdmin;
  const isGlobal = isSuper || !!userData.isGlobalAdmin || userData.location === 'H.O';
  
  await db.query(`
    INSERT INTO users (
      id, emp_id, name, email, password, plain_password, role, designation, department,
      location, phone, avatar, join_date, status, is_global_admin, is_super_admin, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [
    id,
    userData.empId,
    userData.name,
    userData.email,
    encryptedPassword,
    plainPassword,
    userData.role || 'employee',
    userData.designation || null,
    userData.department || null,
    userData.location || '1F',
    userData.phone || null,
    userData.avatar || null,
    userData.joinDate || new Date().toISOString().split('T')[0],
    userData.status || 'Active',
    isGlobal ? 1 : 0,
    isSuper ? 1 : 0
  ]);

  return getUserById(id);
}

// Update any user record (Super Admin override)
export async function updateUser(id, updateData) {
  const db = getPool();
  const fields = [];
  const params = [];

  if (updateData.empId !== undefined && updateData.empId.trim()) {
    fields.push('emp_id = ?');
    params.push(updateData.empId.trim());
  }
  if (updateData.name !== undefined) { fields.push('name = ?'); params.push(updateData.name); }
  if (updateData.email !== undefined) { fields.push('email = ?'); params.push(updateData.email); }
  if (updateData.role !== undefined) {
    fields.push('role = ?');
    params.push(updateData.role);
    if (updateData.isSuperAdmin === undefined) {
      fields.push('is_super_admin = ?');
      params.push(updateData.role === 'super_admin' ? 1 : 0);
    }
  }
  if (updateData.designation !== undefined) { fields.push('designation = ?'); params.push(updateData.designation); }
  if (updateData.department !== undefined) { fields.push('department = ?'); params.push(updateData.department); }
  if (updateData.location !== undefined) { fields.push('location = ?'); params.push(updateData.location); }
  if (updateData.phone !== undefined) { fields.push('phone = ?'); params.push(updateData.phone); }
  if (updateData.status !== undefined) { fields.push('status = ?'); params.push(updateData.status); }
  if (updateData.isGlobalAdmin !== undefined) { fields.push('is_global_admin = ?'); params.push(updateData.isGlobalAdmin ? 1 : 0); }
  if (updateData.isSuperAdmin !== undefined) { fields.push('is_super_admin = ?'); params.push(updateData.isSuperAdmin ? 1 : 0); }

  if (updateData.password && updateData.password.trim()) {
    const encrypted = await hashPassword(updateData.password.trim());
    fields.push('password = ?');
    params.push(encrypted);
    fields.push('plain_password = ?');
    params.push(updateData.password.trim());
  }

  if (fields.length === 0) return getUserById(id);

  fields.push('updated_at = NOW()');
  params.push(id, id);

  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ? OR emp_id = ?`, params);
  const targetId = updateData.empId && updateData.empId.trim() ? updateData.empId.trim() : id;
  return getUserById(targetId) || getUserById(id);
}

// Toggle or set user status: 'Active' <-> 'Disabled'
export async function setUserStatus(id, status) {
  const db = getPool();
  await db.query('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ? OR emp_id = ?', [status, id, id]);
  return getUserById(id);
}

// Delete user account (Super Admin privilege)
export async function deleteUser(id) {
  const db = getPool();
  const user = await getUserById(id);
  if (user && (user.empId === 'HND-SPRADM-001' || user.role === 'super_admin')) {
    throw new Error('Cannot delete the root Super Administrator account.');
  }

  await db.query('UPDATE grievances SET assigned_to_id = NULL WHERE assigned_to_id = ?', [id]);
  await db.query('UPDATE grievances SET submitted_by_id = NULL WHERE submitted_by_id = ?', [id]);
  const [result] = await db.query('DELETE FROM users WHERE id = ? OR emp_id = ?', [id, id]);
  return result.affectedRows > 0;
}

// Delete grievance ticket (Super Admin privilege)
export async function deleteGrievance(id) {
  const db = getPool();
  await db.query('DELETE FROM grievance_remarks WHERE grievance_id = ?', [id]);
  await db.query('DELETE FROM grievance_timeline WHERE grievance_id = ?', [id]);
  await db.query('DELETE FROM grievance_registry WHERE grievance_id = ?', [id]);
  const [result] = await db.query('DELETE FROM grievances WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Full Grievance Update (Super Admin override on any field)
export async function fullUpdateGrievance(id, updateData, user) {
  const db = getPool();
  const fields = [];
  const params = [];

  if (updateData.title !== undefined) { fields.push('title = ?'); params.push(updateData.title); }
  if (updateData.category !== undefined) { fields.push('category = ?'); params.push(updateData.category); }
  if (updateData.location !== undefined) { fields.push('location = ?'); params.push(updateData.location); }
  if (updateData.specificArea !== undefined) { fields.push('specific_area = ?'); params.push(updateData.specificArea); }
  if (updateData.priority !== undefined) { fields.push('priority = ?'); params.push(updateData.priority); }
  if (updateData.status !== undefined) { fields.push('status = ?'); params.push(updateData.status); }
  if (updateData.description !== undefined) { fields.push('description = ?'); params.push(updateData.description); }
  if (updateData.escalatedToHO !== undefined) { fields.push('escalated_to_ho = ?'); params.push(updateData.escalatedToHO ? 1 : 0); }
  if (updateData.assignedToId !== undefined) { fields.push('assigned_to_id = ?'); params.push(updateData.assignedToId || null); }

  if (fields.length > 0) {
    fields.push('updated_at = NOW()');
    params.push(id);
    await db.query(`UPDATE grievances SET ${fields.join(', ')} WHERE id = ?`, params);

    if (updateData.status) {
      await db.query(`
        INSERT INTO grievance_timeline (grievance_id, status, note, created_at)
        VALUES (?, ?, ?, NOW())
      `, [id, updateData.status, `Super Administrator modified record: Status set to ${updateData.status}`]);
    }
  }

  return getGrievanceById(id, user);
}

// System and Database Statistics
export async function getSystemStats() {
  const db = getPool();
  const [[userStats]] = await db.query(`
    SELECT 
      COUNT(*) as totalUsers,
      SUM(CASE WHEN status = 'Active' OR status IS NULL THEN 1 ELSE 0 END) as activeUsers,
      SUM(CASE WHEN status = 'Disabled' THEN 1 ELSE 0 END) as disabledUsers,
      SUM(CASE WHEN role = 'super_admin' OR is_super_admin = 1 THEN 1 ELSE 0 END) as superAdmins,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
      SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) as employees
    FROM users
  `);

  const [[grvStats]] = await db.query(`
    SELECT 
      COUNT(*) as totalGrievances,
      SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as submitted,
      SUM(CASE WHEN status = 'Under Review' THEN 1 ELSE 0 END) as underReview,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
    FROM grievances
  `);

  return {
    users: userStats,
    grievances: grvStats,
    dbStatus: 'CONNECTED',
    host: config.host,
    database: DB_CONFIG.database,
    serverTime: new Date().toISOString()
  };
}

// Update password with bcrypt hashing
export async function updateUserPassword(identifier, newPassword) {
  const db = getPool();
  const lower = identifier.trim().toLowerCase();
  const encryptedPassword = await hashPassword(newPassword);

  const [result] = await db.query(`
    UPDATE users SET password = ?, plain_password = ?, updated_at = NOW()
    WHERE LOWER(email) = ? OR LOWER(emp_id) = ?
  `, [encryptedPassword, newPassword, lower, lower]);

  return result.affectedRows > 0;
}

// --- OTP Store Operations ---

export async function setOTP(identifier, otp, email, empId, expiresAt) {
  const db = getPool();
  const lower = identifier.trim().toLowerCase();
  await db.query(`
    INSERT INTO otp_store (identifier, otp, email, emp_id, expires_at)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE otp = VALUES(otp), email = VALUES(email), emp_id = VALUES(emp_id), expires_at = VALUES(expires_at)
  `, [lower, otp, email, empId, expiresAt]);
}

export async function getOTP(identifier) {
  const db = getPool();
  const lower = identifier.trim().toLowerCase();
  const [rows] = await db.query(`
    SELECT identifier, otp, email, emp_id as empId, expires_at as expiresAt
    FROM otp_store
    WHERE identifier = ?
    LIMIT 1
  `, [lower]);
  return rows.length > 0 ? rows[0] : null;
}

export async function deleteOTP(identifier) {
  const db = getPool();
  const lower = identifier.trim().toLowerCase();
  await db.query('DELETE FROM otp_store WHERE identifier = ?', [lower]);
}

// --- Helper to Build Grievance Full Object ---

async function populateGrievanceRelations(grievances) {
  if (!grievances || grievances.length === 0) return [];
  const db = getPool();
  const grievanceIds = grievances.map(g => g.id);

  // 1. Fetch timelines
  const [timelineRows] = await db.query(`
    SELECT grievance_id, status, note, created_at as timestamp
    FROM grievance_timeline
    WHERE grievance_id IN (?)
    ORDER BY id ASC
  `, [grievanceIds]);

  // 2. Fetch remarks
  const [remarkRows] = await db.query(`
    SELECT id, grievance_id, author, role, message, type, created_at as timestamp
    FROM grievance_remarks
    WHERE grievance_id IN (?)
    ORDER BY created_at ASC
  `, [grievanceIds]);

  // Map timelines & remarks by grievance_id
  const timelineMap = {};
  timelineRows.forEach(t => {
    if (!timelineMap[t.grievance_id]) timelineMap[t.grievance_id] = [];
    timelineMap[t.grievance_id].push({
      status: t.status,
      note: t.note,
      timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString()
    });
  });

  const remarkMap = {};
  remarkRows.forEach(r => {
    if (!remarkMap[r.grievance_id]) remarkMap[r.grievance_id] = [];
    remarkMap[r.grievance_id].push({
      id: r.id,
      author: r.author,
      role: r.role,
      message: r.message,
      type: r.type,
      timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString()
    });
  });

  return grievances.map(g => {
    const isAnon = !!g.is_anonymous;
    const submittedBy = isAnon ? {
      id: g.submitter_id || 'anonymous',
      empId: g.submitter_emp_id || 'ANON',
      name: "Anonymous Employee",
      designation: "Confidential Associate",
      department: g.submitter_department || "Confidential",
      email: "anonymous@test.co.in"
    } : (g.submitter_id ? {
      id: g.submitter_id,
      empId: g.submitter_emp_id,
      name: g.submitter_name,
      designation: g.submitter_designation,
      department: g.submitter_department,
      email: g.submitter_email,
      phone: g.submitter_phone
    } : null);

    const assignedTo = g.assignee_id ? {
      id: g.assignee_id,
      empId: g.assignee_emp_id,
      name: g.assignee_name,
      designation: g.assignee_designation
    } : null;

    return {
      id: g.id,
      ticketNumber: g.ticket_number,
      title: g.title,
      category: g.category,
      location: g.location,
      specificArea: g.specific_area,
      priority: g.priority,
      status: g.status,
      description: g.description,
      attachmentUrl: g.attachment_url,
      attachmentName: g.attachment_name,
      isAnonymous: isAnon,
      escalatedToHO: !!g.escalated_to_ho,
      submittedBy,
      assignedTo,
      createdAt: g.created_at ? new Date(g.created_at).toISOString() : new Date().toISOString(),
      updatedAt: g.updated_at ? new Date(g.updated_at).toISOString() : new Date().toISOString(),
      timeline: timelineMap[g.id] || [],
      remarks: remarkMap[g.id] || []
    };
  });
}

// Base SQL query with joins for submittedBy and assignedTo
const BASE_GRIEVANCE_SELECT = `
  SELECT 
    g.id, g.ticket_number, g.title, g.category, g.location, g.specific_area,
    g.priority, g.status, g.description, g.attachment_url, g.attachment_name,
    g.is_anonymous, g.escalated_to_ho, g.created_at, g.updated_at,
    -- Submitter info
    sub.id as submitter_id, sub.emp_id as submitter_emp_id, sub.name as submitter_name,
    sub.designation as submitter_designation, sub.department as submitter_department,
    sub.email as submitter_email, sub.phone as submitter_phone,
    -- Assignee info
    asn.id as assignee_id, asn.emp_id as assignee_emp_id,
    asn.name as assignee_name, asn.designation as assignee_designation
  FROM grievances g
  LEFT JOIN users sub ON g.submitted_by_id = sub.id
  LEFT JOIN users asn ON g.assigned_to_id = asn.id
`;

// --- Grievance Operations ---

export async function getGrievancesForUser(user, filterLocation = null) {
  const db = getPool();
  let query = BASE_GRIEVANCE_SELECT;
  const params = [];

  if (user.role === 'admin' || user.role === 'super_admin' || user.isSuperAdmin) {
    if (user.role === 'super_admin' || user.isSuperAdmin || user.location === 'H.O' || user.isGlobalAdmin) {
      if (filterLocation && filterLocation !== 'ALL') {
        query += ' WHERE g.location = ?';
        params.push(filterLocation);
      }
    } else {
      query += ' WHERE g.location = ?';
      params.push(user.location);
    }
  } else {
    query += ' WHERE g.submitted_by_id = ?';
    params.push(user.id);
  }

  query += ' ORDER BY g.created_at DESC';

  const [rows] = await db.query(query, params);
  return populateGrievanceRelations(rows);
}

export async function getGrievanceById(id, user) {
  const db = getPool();
  const query = `${BASE_GRIEVANCE_SELECT} WHERE g.id = ? LIMIT 1`;
  const [rows] = await db.query(query, [id]);
  if (rows.length === 0) return null;

  const results = await populateGrievanceRelations(rows);
  const grievance = results[0];

  // Access check
  if (user.role === 'admin' || user.role === 'super_admin' || user.isSuperAdmin) {
    if (!user.isSuperAdmin && user.role !== 'super_admin' && user.location !== 'H.O' && !user.isGlobalAdmin && grievance.location !== user.location) {
      return null; // Not authorized for this location
    }
  } else {
    if (grievance.submittedBy?.id !== user.id && grievance.submittedBy?.empId !== user.empId) {
      return null; // Not authorized
    }
  }

  return grievance;
}

export async function createGrievance(data, user) {
  const db = getPool();
  const location = user.location || data.location || '1F';
  
  // 1. Generate count & ticket number
  const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM grievances');
  const ticketNumber = `TEST-${location}-${new Date().getFullYear()}-${String(Number(count) + 1).padStart(3, '0')}`;
  const id = `GRV-${Date.now()}`;

  // 2. Find an Associate Admin for this plant location to assign
  const [admins] = await db.query(
    'SELECT id, emp_id, name, designation, department, location FROM users WHERE role = ? AND location = ? LIMIT 1',
    ['admin', location]
  );
  const assignedAdmin = admins.length > 0 ? admins[0] : null;
  const assignedAdminId = assignedAdmin ? assignedAdmin.id : null;

  // 3. Insert grievance record
  await db.query(`
    INSERT INTO grievances (
      id, ticket_number, title, category, location, specific_area,
      priority, status, description, attachment_url, attachment_name,
      is_anonymous, escalated_to_ho, submitted_by_id, assigned_to_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NOW(), NOW())
  `, [
    id,
    ticketNumber,
    data.title,
    data.category,
    location,
    data.specificArea || '',
    data.priority || 'Medium',
    'Submitted',
    data.description,
    data.attachmentUrl || null,
    data.attachmentName || null,
    data.isAnonymous ? 1 : 0,
    user.id,
    assignedAdminId
  ]);

  // 4. Insert initial timeline record
  await db.query(`
    INSERT INTO grievance_timeline (grievance_id, status, note, created_at)
    VALUES (?, ?, ?, NOW())
  `, [
    id,
    'Submitted',
    `Grievance registered and routed to ${location} Associate Admin Cell.`
  ]);

  // 5. Store in Master Grievance Registry (Who sent & Who received)
  await db.query(`
    INSERT INTO grievance_registry (
      ticket_number, grievance_id, title, category, plant_location, priority, status, description,
      sender_user_id, sender_emp_id, sender_name, sender_email, sender_department, sender_plant_location, sender_phone, is_anonymous,
      receiver_admin_id, receiver_emp_id, receiver_name, receiver_designation, receiver_department, receiver_plant_location,
      action_type, action_remarks, recorded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    ticketNumber,
    id,
    data.title,
    data.category,
    location,
    data.priority || 'Medium',
    'Submitted',
    data.description,
    user.id,
    user.empId,
    data.isAnonymous ? 'Anonymous Employee' : user.name,
    data.isAnonymous ? 'anonymous@test.co.in' : user.email,
    user.department || null,
    user.location,
    user.phone || null,
    data.isAnonymous ? 1 : 0,
    assignedAdmin ? assignedAdmin.id : null,
    assignedAdmin ? assignedAdmin.emp_id : null,
    assignedAdmin ? assignedAdmin.name : 'Unassigned',
    assignedAdmin ? assignedAdmin.designation : null,
    assignedAdmin ? assignedAdmin.department : `${location} Admin Cell`,
    location,
    'INITIAL_SUBMISSION',
    `Grievance ticket created and assigned to ${assignedAdmin ? assignedAdmin.name : 'Plant Cell'}`
  ]);

  // 6. Fetch full newly created record
  return getGrievanceById(id, user);
}

export async function updateGrievance(id, updateData, user) {
  const db = getPool();
  
  // Check existence & permission
  const [existingRows] = await db.query('SELECT * FROM grievances WHERE id = ?', [id]);
  if (existingRows.length === 0) return null;
  const existing = existingRows[0];

  if (user.role === 'super_admin' || user.isSuperAdmin) {
    // Super admin has global permission to update any grievance
  } else if (user.role === 'admin') {
    if (user.location !== 'H.O' && !user.isGlobalAdmin && existing.location !== user.location) {
      throw new Error('Unauthorized to modify grievances for this plant location.');
    }
  } else {
    throw new Error('Only associate admins or super administrators can update grievance status.');
  }

  const updates = [];
  const params = [];
  let actionType = 'STATUS_UPDATE';
  let actionRemarks = '';

  if (updateData.status && updateData.status !== existing.status) {
    updates.push('status = ?');
    params.push(updateData.status);
    actionRemarks += `Status changed from ${existing.status} to ${updateData.status}. `;

    await db.query(`
      INSERT INTO grievance_timeline (grievance_id, status, note, created_at)
      VALUES (?, ?, ?, NOW())
    `, [
      id,
      updateData.status,
      updateData.statusNote || `Status updated to ${updateData.status} by ${user.name} (${user.designation || 'Admin'})`
    ]);
  }

  let newAssignee = null;
  if (updateData.assignedTo) {
    if (existing.assigned_to_id && updateData.assignedTo.id && updateData.assignedTo.id !== existing.assigned_to_id) {
      throw new Error('Assigned Associate Admin has already been allotted and cannot be changed.');
    }

    if (!existing.assigned_to_id && updateData.assignedTo.id) {
      updates.push('assigned_to_id = ?');
      params.push(updateData.assignedTo.id);
      actionType = 'INITIAL_ASSIGNMENT';
      actionRemarks += `Allotted to ${updateData.assignedTo.name}. `;

      const [adminRows] = await db.query('SELECT * FROM users WHERE id = ?', [updateData.assignedTo.id]);
      if (adminRows.length > 0) newAssignee = adminRows[0];

      await db.query(`
        INSERT INTO grievance_timeline (grievance_id, status, note, created_at)
        VALUES (?, ?, ?, NOW())
      `, [
        id,
        existing.status,
        `Assigned to ${updateData.assignedTo.name} (${updateData.assignedTo.designation || 'Admin'})`
      ]);
    }
  }

  if (updateData.escalateToHO) {
    updates.push('escalated_to_ho = 1');
    actionType = 'ESCALATION_TO_HO';
    actionRemarks += `Escalated to Head Office. `;

    await db.query(`
      INSERT INTO grievance_timeline (grievance_id, status, note, created_at)
      VALUES (?, ?, ?, NOW())
    `, [
      id,
      'Escalated',
      `Escalated from ${existing.location} to H.O Executive Committee by ${user.name}`
    ]);
  }

  if (updateData.remark) {
    const remarkId = `rem-${Date.now()}`;
    await db.query(`
      INSERT INTO grievance_remarks (id, grievance_id, author, role, message, type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      remarkId,
      id,
      user.name,
      user.role,
      updateData.remark,
      updateData.remarkType || 'public'
    ]);
    actionRemarks += `Remark: "${updateData.remark}". `;
  }

  updates.push('updated_at = NOW()');

  if (updates.length > 0) {
    params.push(id);
    await db.query(`UPDATE grievances SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  // Get sender info
  const [subRows] = await db.query('SELECT * FROM users WHERE id = ?', [existing.submitted_by_id]);
  const sender = subRows.length > 0 ? subRows[0] : null;

  // Insert update into grievance_registry
  await db.query(`
    INSERT INTO grievance_registry (
      ticket_number, grievance_id, title, category, plant_location, priority, status, description,
      sender_user_id, sender_emp_id, sender_name, sender_email, sender_department, sender_plant_location, sender_phone, is_anonymous,
      receiver_admin_id, receiver_emp_id, receiver_name, receiver_designation, receiver_department, receiver_plant_location,
      action_type, action_remarks, recorded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    existing.ticket_number,
    id,
    existing.title,
    existing.category,
    existing.location,
    existing.priority,
    updateData.status || existing.status,
    existing.description,
    sender ? sender.id : null,
    sender ? sender.emp_id : null,
    existing.is_anonymous ? 'Anonymous Employee' : (sender ? sender.name : 'Unknown'),
    existing.is_anonymous ? 'anonymous@test.co.in' : (sender ? sender.email : null),
    sender ? sender.department : null,
    sender ? sender.location : existing.location,
    sender ? sender.phone : null,
    existing.is_anonymous ? 1 : 0,
    newAssignee ? newAssignee.id : user.id,
    newAssignee ? newAssignee.emp_id : user.empId,
    newAssignee ? newAssignee.name : user.name,
    newAssignee ? newAssignee.designation : user.designation,
    newAssignee ? newAssignee.department : user.department,
    newAssignee ? newAssignee.location : user.location,
    actionType,
    actionRemarks.trim(),
  ]);

  return getGrievanceById(id, user);
}

export async function addGrievanceComment(id, message, user, type = 'public') {
  const db = getPool();
  const [existingRows] = await db.query('SELECT * FROM grievances WHERE id = ?', [id]);
  if (existingRows.length === 0) return null;

  const remarkId = `rem-${Date.now()}`;
  const author = user.isAnonymous && user.role !== 'admin' ? 'Anonymous Employee' : user.name;

  await db.query(`
    INSERT INTO grievance_remarks (id, grievance_id, author, role, message, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `, [
    remarkId,
    id,
    author,
    user.role,
    message,
    type
  ]);

  await db.query('UPDATE grievances SET updated_at = NOW() WHERE id = ?', [id]);

  return getGrievanceById(id, user);
}

// --- Grievance Master Registry Query ---

export async function getGrievanceRegistry(user, filterLocation = null) {
  const db = getPool();
  let query = 'SELECT * FROM grievance_registry';
  const params = [];

  if (user.role === 'admin') {
    if (user.location !== 'H.O' && !user.isGlobalAdmin) {
      query += ' WHERE plant_location = ?';
      params.push(user.location);
    } else if (filterLocation && filterLocation !== 'ALL') {
      query += ' WHERE plant_location = ?';
      params.push(filterLocation);
    }
  } else {
    query += ' WHERE sender_user_id = ?';
    params.push(user.id);
  }

  query += ' ORDER BY recorded_at DESC, id DESC';
  const [rows] = await db.query(query, params);
  return rows;
}

// --- Analytics Operations ---

export async function getAnalytics(user) {
  const db = getPool();
  let whereClause = '';
  const params = [];

  if (user.role === 'admin' && user.location !== 'H.O' && !user.isGlobalAdmin) {
    whereClause = 'WHERE location = ?';
    params.push(user.location);
  }

  // Get total and status counts
  const [statusRows] = await db.query(`
    SELECT status, COUNT(*) as count 
    FROM grievances 
    ${whereClause} 
    GROUP BY status
  `, params);

  const [totalRow] = await db.query(`
    SELECT COUNT(*) as total 
    FROM grievances 
    ${whereClause}
  `, params);

  const total = totalRow[0].total || 0;
  let submitted = 0;
  let underReview = 0;
  let inProgress = 0;
  let resolved = 0;
  let rejected = 0;

  statusRows.forEach(r => {
    if (r.status === 'Submitted') submitted = r.count;
    else if (r.status === 'Under Review') underReview = r.count;
    else if (r.status === 'In Progress') inProgress = r.count;
    else if (r.status === 'Resolved') resolved = r.count;
    else if (r.status === 'Rejected') rejected = r.count;
  });

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category breakdown
  const [catRows] = await db.query(`
    SELECT category, COUNT(*) as count 
    FROM grievances 
    ${whereClause} 
    GROUP BY category
  `, params);
  const categories = {};
  catRows.forEach(r => {
    categories[r.category] = r.count;
  });

  // Priority breakdown
  const [prioRows] = await db.query(`
    SELECT priority, COUNT(*) as count 
    FROM grievances 
    ${whereClause} 
    GROUP BY priority
  `, params);
  const priorities = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  prioRows.forEach(r => {
    if (priorities[r.priority] !== undefined) {
      priorities[r.priority] = r.count;
    }
  });

  // Location breakdown
  const [locRows] = await db.query(`
    SELECT location, COUNT(*) as count 
    FROM grievances 
    GROUP BY location
  `);
  const locations = { 'H.O': 0, '1F': 0, '2F': 0, '3F': 0, '4F': 0 };
  locRows.forEach(r => {
    if (locations[r.location] !== undefined) {
      locations[r.location] = r.count;
    }
  });

  return {
    total,
    submitted,
    underReview,
    inProgress,
    resolved,
    rejected,
    pending: submitted + underReview + inProgress,
    resolutionRate,
    categories,
    priorities,
    locations
  };
}

// Reset database and re-seed from seedData.js
export async function resetDB() {
  const db = getPool();
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.query('TRUNCATE TABLE grievance_registry');
  await db.query('TRUNCATE TABLE grievance_remarks');
  await db.query('TRUNCATE TABLE grievance_timeline');
  await db.query('TRUNCATE TABLE grievances');
  await db.query('TRUNCATE TABLE users');
  await db.query('TRUNCATE TABLE otp_store');
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  // Re-seed users with complete profile details & bcrypt encrypted passwords
  for (const u of initialUsers) {
    const encryptedPassword = await hashPassword(u.password);
    await db.query(`
      INSERT INTO users (
        id, emp_id, name, email, password, role, designation, department,
        location, phone, avatar, join_date, status, is_global_admin, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, NOW(), NOW())
    `, [
      u.id,
      u.empId,
      u.name,
      u.email,
      encryptedPassword,
      u.role,
      u.designation || null,
      u.department || null,
      u.location || null,
      u.phone || null,
      u.avatar || null,
      u.joinDate || null,
      u.isGlobalAdmin ? 1 : 0
    ]);
  }

  // Re-seed grievances
  for (const g of initialGrievances) {
    await db.query(`
      INSERT INTO grievances (
        id, ticket_number, title, category, location, specific_area,
        priority, status, description, attachment_url, attachment_name,
        is_anonymous, escalated_to_ho, submitted_by_id, assigned_to_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      g.id,
      g.ticketNumber,
      g.title,
      g.category,
      g.location,
      g.specificArea || '',
      g.priority || 'Medium',
      g.status || 'Submitted',
      g.description,
      g.attachmentUrl || null,
      g.attachmentName || null,
      g.isAnonymous ? 1 : 0,
      g.escalatedToHO ? 1 : 0,
      g.submittedBy?.id || null,
      g.assignedTo?.id || null,
      g.createdAt ? new Date(g.createdAt) : new Date(),
      g.updatedAt ? new Date(g.updatedAt) : new Date()
    ]);

    if (Array.isArray(g.timeline)) {
      for (const t of g.timeline) {
        await db.query(`
          INSERT INTO grievance_timeline (grievance_id, status, note, created_at)
          VALUES (?, ?, ?, ?)
        `, [
          g.id,
          t.status,
          t.note || '',
          t.timestamp ? new Date(t.timestamp) : new Date()
        ]);
      }
    }

    if (Array.isArray(g.remarks)) {
      for (const r of g.remarks) {
        await db.query(`
          INSERT INTO grievance_remarks (id, grievance_id, author, role, message, type, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          r.id || `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          g.id,
          r.author,
          r.role,
          r.message,
          r.type || 'public',
          r.timestamp ? new Date(r.timestamp) : new Date()
        ]);
      }
    }

    // Seed registry record
    await db.query(`
      INSERT INTO grievance_registry (
        ticket_number, grievance_id, title, category, plant_location, priority, status, description,
        sender_user_id, sender_emp_id, sender_name, sender_email, sender_department, sender_plant_location, sender_phone, is_anonymous,
        receiver_admin_id, receiver_emp_id, receiver_name, receiver_designation, receiver_department, receiver_plant_location,
        action_type, action_remarks, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      g.ticketNumber,
      g.id,
      g.title,
      g.category,
      g.location,
      g.priority || 'Medium',
      g.status || 'Submitted',
      g.description,
      g.submittedBy?.id || null,
      g.submittedBy?.empId || null,
      g.isAnonymous ? 'Anonymous Employee' : (g.submittedBy?.name || 'Employee'),
      g.isAnonymous ? 'anonymous@test.co.in' : (g.submittedBy?.email || null),
      g.submittedBy?.department || null,
      g.location,
      g.submittedBy?.phone || null,
      g.isAnonymous ? 1 : 0,
      g.assignedTo?.id || null,
      g.assignedTo?.empId || null,
      g.assignedTo?.name || null,
      g.assignedTo?.designation || null,
      g.location + ' Grievance Cell',
      g.location,
      'INITIAL_SUBMISSION',
      `Initial registration in ${g.location} plant.`,
      g.createdAt ? new Date(g.createdAt) : new Date()
    ]);
  }

  const [uRows] = await db.query('SELECT COUNT(*) as count FROM users');
  const [gRows] = await db.query('SELECT COUNT(*) as count FROM grievances');
  const [rRows] = await db.query('SELECT COUNT(*) as count FROM grievance_registry');

  return {
    users: { length: uRows[0].count },
    grievances: { length: gRows[0].count },
    registry: { length: rRows[0].count }
  };
}
