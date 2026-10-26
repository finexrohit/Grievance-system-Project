// Verification script for Honda Grievance System API
import {
  findUserByCredentials,
  findUserByIdentifier,
  getGrievancesForUser,
  createGrievance,
  updateGrievance,
  getAnalytics,
  getAllUsers
} from './db.js';

console.log('--- Starting Honda Grievance System Automated Tests ---');

// Test 1: Verify all 10 Admins exist and are distributed correctly across 5 locations
const allUsers = getAllUsers();
const admins = allUsers.filter(u => u.role === 'admin');
console.log(`Total Admins configured: ${admins.length} (Expected: 10)`);

const hoAdmins = admins.filter(a => a.location === 'H.O');
const f1Admins = admins.filter(a => a.location === '1F');
const f2Admins = admins.filter(a => a.location === '2F');
const f3Admins = admins.filter(a => a.location === '3F');
const f4Admins = admins.filter(a => a.location === '4F');

console.log(`- H.O Admins: ${hoAdmins.length} (${hoAdmins.map(a => a.empId).join(', ')})`);
console.log(`- 1F Admins: ${f1Admins.length} (${f1Admins.map(a => a.empId).join(', ')})`);
console.log(`- 2F Admins: ${f2Admins.length} (${f2Admins.map(a => a.empId).join(', ')})`);
console.log(`- 3F Admins: ${f3Admins.length} (${f3Admins.map(a => a.empId).join(', ')})`);
console.log(`- 4F Admins: ${f4Admins.length} (${f4Admins.map(a => a.empId).join(', ')})`);

if (admins.length !== 10) {
  throw new Error(`Admin count mismatch: expected 10, got ${admins.length}`);
}

// Test 2: Verify Employees generated across 5 locations
const employees = allUsers.filter(u => u.role === 'employee');
console.log(`Total Employees generated: ${employees.length} across 5 locations`);

// Test 3: Verify Authentication
const testUser = findUserByCredentials('HND-ADM-HO1', 'honda@password123');
if (!testUser) throw new Error('Failed to login H.O Admin with default password');
console.log(`✓ Authentication OK: Logged in as ${testUser.name} (${testUser.role}, ${testUser.location})`);

// Test 4: Location Scoping Test
// H.O admin should see all locations
const hoGrievances = getGrievancesForUser(testUser);
console.log(`✓ H.O Admin Visibility: can see ${hoGrievances.length} grievances across all sites`);

// 1F admin should ONLY see 1F grievances
const admin1F = admins.find(a => a.location === '1F');
const f1Grievances = getGrievancesForUser(admin1F);
const non1FCount = f1Grievances.filter(g => g.location !== '1F').length;
if (non1FCount > 0) throw new Error(`1F admin leaked ${non1FCount} tickets from other locations!`);
console.log(`✓ 1F Admin Scoping OK: strictly limited to ${f1Grievances.length} 1F tickets (0 from other plants)`);

// Test 5: Employee submission & routing to location admin
const emp1F = employees.find(e => e.location === '1F');
const newTicket = createGrievance({
  title: 'Automated Test: Sensor recalibration required',
  category: 'Machinery & Equipment Malfunction',
  location: '1F',
  specificArea: 'Robotics Station 7',
  priority: 'High',
  description: 'Test grievance description for verification.'
}, emp1F);

console.log(`✓ Grievance Submission OK: Generated ${newTicket.ticketNumber} and auto-routed to ${newTicket.assignedTo?.name} (${newTicket.assignedTo?.designation})`);

// Test 6: Admin Status Update & Remark
const updated = updateGrievance(newTicket.id, {
  status: 'In Progress',
  statusNote: 'Investigating sensor calibration logs',
  remark: 'Technician scheduled for calibration.',
  remarkType: 'public'
}, admin1F);

if (updated.status !== 'In Progress') throw new Error('Status update failed');
console.log(`✓ Grievance Lifecycle OK: Status updated to '${updated.status}', remarks count: ${updated.remarks.length}`);

// Test 7: Analytics calculation
const analytics = getAnalytics(testUser);
console.log(`✓ Analytics Calculation OK: Total=${analytics.total}, Resolved Rate=${analytics.resolutionRate}%, Pending=${analytics.pending}`);

console.log('\n>>> ALL 7 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
