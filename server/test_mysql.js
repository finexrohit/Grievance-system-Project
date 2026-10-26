import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { initDB, findUserByCredentials, createGrievance, getGrievancesForUser, getAnalytics, getGrievanceRegistry } from './db.js';

dotenv.config();

async function runTest() {
  console.log('--- Testing MySQL Database Connection ---');
  console.log(`Connecting to ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306} as ${process.env.DB_USER || 'root'}`);
  
  try {
    await initDB();
    
    console.log('\n--- 1. Testing User Login ---');
    const user = await findUserByCredentials('rajeshwar.sharma@honda.co.in', 'honda@password123');
    if (user) {
      console.log('✅ Found admin user:', user.name, `(${user.designation})`);
    } else {
      console.log('❌ User not found');
    }

    console.log('\n--- 2. Testing Fetch Grievances ---');
    const list = await getGrievancesForUser(user);
    console.log(`✅ Retrieved ${list.length} grievances from MySQL.`);

    console.log('\n--- 3. Testing Analytics ---');
    const stats = await getAnalytics(user);
    console.log('✅ Analytics summary:', {
      total: stats.total,
      submitted: stats.submitted,
      inProgress: stats.inProgress,
      resolved: stats.resolved
    });

    console.log('\n--- 4. Testing Grievance Registry (Sender & Receiver Audit) ---');
    const registry = await getGrievanceRegistry(user);
    console.log(`✅ Retrieved ${registry.length} registry entries from grievance_registry table.`);
    if (registry.length > 0) {
      console.log('Latest dispatch entry:', {
        ticket: registry[0].ticket_number,
        sender: `${registry[0].sender_name} (${registry[0].sender_emp_id})`,
        receiver: `${registry[0].receiver_name} (${registry[0].receiver_emp_id})`,
        plant: registry[0].plant_location,
        action: registry[0].action_type
      });
    }

    console.log('\n🎉 All MySQL database tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTest();
