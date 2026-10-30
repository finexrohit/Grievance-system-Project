-- Test Grievance Management System Database Schema
CREATE DATABASE IF NOT EXISTS test_grievance_db;
USE test_grievance_db;

-- 1. Complete Users & Employee Credentials Table
-- Stores all employee/admin IDs, passwords, departments, locations, contact info, and profile details
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

-- 2. Grievances Table
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
    FOREIGN KEY (submitted_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Grievance Timeline Table
CREATE TABLE IF NOT EXISTS grievance_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE
);

-- 4. Grievance Remarks / Comments Table
CREATE TABLE IF NOT EXISTS grievance_remarks (
    id VARCHAR(50) PRIMARY KEY,
    grievance_id VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('public', 'internal') DEFAULT 'public',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE
);

-- 5. OTP Verification Store
CREATE TABLE IF NOT EXISTS otp_store (
    identifier VARCHAR(100) PRIMARY KEY,
    otp VARCHAR(10) NOT NULL,
    email VARCHAR(100),
    emp_id VARCHAR(50),
    expires_at BIGINT NOT NULL
);

-- 6. Comprehensive Grievance Dispatch & Routing Registry
-- Stores full record of who submitted each grievance, who received/handled it, and full dispatch audit
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
    
    -- SENDER / SUBMITTER DETAILS
    sender_user_id VARCHAR(50),
    sender_emp_id VARCHAR(50),
    sender_name VARCHAR(100),
    sender_email VARCHAR(100),
    sender_department VARCHAR(100),
    sender_plant_location VARCHAR(50),
    sender_phone VARCHAR(20),
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- RECEIVER / ASSIGNED ADMIN DETAILS
    receiver_admin_id VARCHAR(50),
    receiver_emp_id VARCHAR(50),
    receiver_name VARCHAR(100),
    receiver_designation VARCHAR(100),
    receiver_department VARCHAR(100),
    receiver_plant_location VARCHAR(50),
    
    -- ACTION / EVENT TYPE & NOTES
    action_type VARCHAR(50) DEFAULT 'INITIAL_SUBMISSION',
    action_remarks TEXT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_reg_ticket (ticket_number),
    INDEX idx_reg_grievance (grievance_id),
    INDEX idx_reg_sender (sender_emp_id),
    INDEX idx_reg_receiver (receiver_emp_id),
    INDEX idx_reg_location (plant_location)
);
