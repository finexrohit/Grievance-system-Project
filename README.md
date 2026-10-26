# 🚗 Honda Grievance Redressal & Resolution System

An enterprise-grade, location-aware Grievance Management System built for **Honda Motor Company**. The system supports **5 facility locations** (`H.O`, `1F`, `2F`, `3F`, `4F`), **10 Associate Admins**, pre-generated employees with realistic designations, a complete grievance lifecycle, an executive analytics dashboard, and authentication with password recovery.

---

## 🌟 Key Features

1. **Honda Corporate Authentication**:
   - Clean, branded login portal with dark automotive aesthetic.
   - **Forgot Password Workflow**: 3-step recovery flow (Employee ID/Email verification $\rightarrow$ 6-digit OTP verification $\rightarrow$ New password reset).
   - **1-Click Demo Credentials Switcher**: Effortlessly switch between any of the 10 Admins or 30 Employees directly from the login page or top navigation bar.

2. **Location-Based Role Scoping**:
   - **`H.O` (Head Office)**: 1 Principal Associate Admin with global oversight across all 5 locations plus filterable tabs (`ALL`, `H.O`, `1F`, `2F`, `3F`, `4F`).
   - **`1F` (Factory 1 - Chassis & Assembly)**: 3 Associate Admins with strict plant-level isolation.
   - **`2F` (Factory 2 - Engine & Machining)**: 3 Associate Admins with strict plant-level isolation.
   - **`3F` (Factory 3 - EV Battery & Body BIW)**: 2 Associate Admins with strict plant-level isolation.
   - **`4F` (Factory 4 - Casting & Logistics)**: 1 Associate Admin with strict plant-level isolation.

3. **Employee Portal**:
   - Lodge new grievances with Category, Location, Specific Shop/Floor, Priority (`Low`, `Medium`, `High`, `Critical`), Detailed Statement, and Optional Attachment.
   - **Anonymous Lodging Mode**: Protects employee identity for sensitive disclosures.
   - Real-time status tracking with visual timeline and communication history.
   - Follow-up comments & remarks directly to the handling Associate Admin.

4. **Associate Admin Portal**:
   - Actionable grievance queue with location, priority, and category filters.
   - Full lifecycle management (`Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` / `Rejected`).
   - Add **Public Resolution Remarks** (visible to employee) or **Internal Investigation Notes** (private to admins).
   - Assign tickets to specific Associate Admins within the plant.
   - **Escalate to H.O** button for critical multi-plant or executive interventions.

5. **Organizational Directory**:
   - Searchable and filterable roster of all 10 Admins and 30 Employees by plant, designation, and contact details.

6. **Executive Analytics & CSV Export**:
   - Resolution success rate metrics, active queues, categorical breakdown, priority severity meters, plant distribution, and CSV export.

---

## 🔑 Login Credentials Reference

> [!NOTE]
> Default password for all pre-seeded accounts: **`honda@password123`**

### 🛡️ 10 Associate Admins (5 Locations)

| Location | Employee ID | Name | Official Email | Designation |
|---|---|---|---|---|
| **H.O** | `HND-ADM-HO1` | Rajeshwar Sharma | `rajeshwar.sharma@honda.co.in` | Head Office Principal Associate Admin |
| **1F** | `HND-ADM-1F1` | Vikramaditya Patel | `vikram.patel@honda.co.in` | Plant 1 Associate Admin (Shift A) |
| **1F** | `HND-ADM-1F2` | Sunita Verma | `sunita.verma@honda.co.in` | Plant 1 Associate Admin (Shift B) |
| **1F** | `HND-ADM-1F3` | Amitabh Saxena | `amitabh.saxena@honda.co.in` | Plant 1 Associate Admin (General Shift) |
| **2F** | `HND-ADM-2F1` | Meenakshi Iyer | `meenakshi.iyer@honda.co.in` | Plant 2 Associate Admin (Lead) |
| **2F** | `HND-ADM-2F2` | Rahul Nair | `rahul.nair@honda.co.in` | Plant 2 Associate Admin (Shift A) |
| **2F** | `HND-ADM-2F3` | Pooja Deshmukh | `pooja.deshmukh@honda.co.in` | Plant 2 Associate Admin (Shift B) |
| **3F** | `HND-ADM-3F1` | Ananya Roy Chowdhury | `ananya.roy@honda.co.in` | Plant 3 Associate Admin (Senior) |
| **3F** | `HND-ADM-3F2` | Sanjay K. Rao | `sanjay.rao@honda.co.in` | Plant 3 Associate Admin (Operations) |
| **4F** | `HND-ADM-4F1` | Deepak Joshi | `deepak.joshi@honda.co.in` | Plant 4 Sole Associate Admin |

### 👷 Sample Pre-Generated Employees (30 Total across all 5 locations)

| Location | Employee ID | Name | Department | Designation |
|---|---|---|---|---|
| **H.O** | `HND-HO-101` | Arjun Singhal | Corporate Strategic Planning | Assistant Manager - Strategy |
| **H.O** | `HND-HO-102` | Priyanka Sen | R&D Powertrain Systems | Senior Design Engineer |
| **1F** | `HND-1F-201` | Rohan Kulkarni | Chassis Assembly Line 1 | Senior Assembly Technician |
| **1F** | `HND-1F-202` | Kavita Reddy | Quality Assurance & Testing | Quality Inspection Engineer |
| **1F** | `HND-1F-203` | Manish Solanki | Automated Welding Cell | Robotics Operator |
| **2F** | `HND-2F-301` | Tanvi Agarwal | Engine Machining Shop | CNC Milling Specialist |
| **2F** | `HND-2F-302` | Prakash Hegde | Transmission Assembly Line | Assembly Line In-Charge |
| **3F** | `HND-3F-401` | Karan Johar | Electric Vehicle Battery Pack Unit | High Voltage Battery Technician |
| **3F** | `HND-3F-402` | Ritika Ghosh | Electronics & Sensor Calibration | ECU Calibration Engineer |
| **4F** | `HND-4F-501` | Anil Deshpande | Casting & Foundry Shop | Die Casting Master Technician |
| **4F** | `HND-4F-502` | Shalini Dixit | Environmental & Waste Management | ETP & STP Plant In-Charge |

*(Full list of all 30 employees is accessible directly in the Personnel Directory inside the application).*

---

## 🚀 How to Run the Application

### Option A: Run Full Production App (Single Command)
```bash
npm start
```
Then open your browser to **`http://localhost:5000`**.

### Option B: Run in Development Mode (Hot-Reload)
```bash
npm run dev
```
- Frontend: **`http://localhost:5173`**
- Backend API: **`http://localhost:5000`**

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Canvas Confetti
- **Backend**: Node.js, Express, RESTful JSON Persistence
- **Security**: Role-Based & Location-Based Authorization
