export const initialUsers = [
  // --- SUPER ADMINISTRATOR (MASTER ROOT ACCESS & SYSTEM CONTROL) ---
  {
    id: "admin-super-1",
    empId: "HND-SPRADM-001",
    name: "Test Super Administrator",
    email: "superadmin@test.co.in",
    password: "test@superadmin123",
    role: "super_admin",
    location: "H.O",
    department: "Executive Management & Corporate IT",
    designation: "Chief Super Administrator",
    phone: "+91 98000 00001",
    isGlobalAdmin: true,
    isSuperAdmin: true,
    status: "Active",
    joinDate: "2024-01-01",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },

  // --- 10 ADMINS ACROSS 5 LOCATIONS ---
  {
    id: "admin-ho-1",
    empId: "HND-ADM-HO1",
    name: "Rajeshwar Sharma",
    email: "rajeshwar.sharma@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "H.O",
    department: "Corporate Human Resources & Operations",
    designation: "Head Office Principal Associate Admin",
    phone: "+91 98110 23451",
    isGlobalAdmin: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-1f-1",
    empId: "HND-ADM-1F1",
    name: "Vikramaditya Patel",
    email: "vikram.patel@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "1F",
    department: "Plant 1 HR & Employee Welfare",
    designation: "Plant 1 Associate Admin (Shift A)",
    phone: "+91 98220 34562",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-1f-2",
    empId: "HND-ADM-1F2",
    name: "Sunita Verma",
    email: "sunita.verma@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "1F",
    department: "Plant 1 Operations & Grievance Cell",
    designation: "Plant 1 Associate Admin (Shift B)",
    phone: "+91 98220 34563",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-1f-3",
    empId: "HND-ADM-1F3",
    name: "Amitabh Saxena",
    email: "amitabh.saxena@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "1F",
    department: "Plant 1 Safety & Environmental Affairs",
    designation: "Plant 1 Associate Admin (General Shift)",
    phone: "+91 98220 34564",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-2f-1",
    empId: "HND-ADM-2F1",
    name: "Meenakshi Iyer",
    email: "meenakshi.iyer@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "2F",
    department: "Plant 2 HR & Associate Welfare",
    designation: "Plant 2 Associate Admin (Lead)",
    phone: "+91 98330 45671",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-2f-2",
    empId: "HND-ADM-2F2",
    name: "Rahul Nair",
    email: "rahul.nair@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "2F",
    department: "Plant 2 Employee Relations",
    designation: "Plant 2 Associate Admin (Shift A)",
    phone: "+91 98330 45672",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-2f-3",
    empId: "HND-ADM-2F3",
    name: "Pooja Deshmukh",
    email: "pooja.deshmukh@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "2F",
    department: "Plant 2 Health & Safety Cell",
    designation: "Plant 2 Associate Admin (Shift B)",
    phone: "+91 98330 45673",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-3f-1",
    empId: "HND-ADM-3F1",
    name: "Ananya Roy Chowdhury",
    email: "ananya.roy@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "3F",
    department: "Plant 3 HR & Administrative Cell",
    designation: "Plant 3 Associate Admin (Senior)",
    phone: "+91 98440 56781",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-3f-2",
    empId: "HND-ADM-3F2",
    name: "Sanjay K. Rao",
    email: "sanjay.rao@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "3F",
    department: "Plant 3 Workplace Relations",
    designation: "Plant 3 Associate Admin (Operations)",
    phone: "+91 98440 56782",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-4f-1",
    empId: "HND-ADM-4F1",
    name: "Deepak Joshi",
    email: "deepak.joshi@test.co.in",
    password: "test@password123",
    role: "admin",
    location: "4F",
    department: "Plant 4 Administration & Grievance Unit",
    designation: "Plant 4 Sole Associate Admin",
    phone: "+91 98550 67891",
    isGlobalAdmin: false,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },

  // --- 30 RANDOM EMPLOYEES ACROSS ALL 5 LOCATIONS ---
  // H.O Employees
  {
    id: "emp-ho-1",
    empId: "HND-HO-101",
    name: "Arjun Singhal",
    email: "arjun.singhal@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "H.O",
    department: "Corporate Strategic Planning",
    designation: "Assistant Manager - Strategy",
    phone: "+91 97110 10101",
    joinDate: "2021-03-15"
  },
  {
    id: "emp-ho-2",
    empId: "HND-HO-102",
    name: "Priyanka Sen",
    email: "priyanka.sen@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "H.O",
    department: "R&D Powertrain Systems",
    designation: "Senior Design Engineer",
    phone: "+91 97110 10102",
    joinDate: "2020-07-10"
  },
  {
    id: "emp-ho-3",
    empId: "HND-HO-103",
    name: "Mohit Chauhan",
    email: "mohit.chauhan@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "H.O",
    department: "Finance & Taxation",
    designation: "Senior Financial Analyst",
    phone: "+91 97110 10103",
    joinDate: "2022-01-20"
  },
  {
    id: "emp-ho-4",
    empId: "HND-HO-104",
    name: "Divya Kapoor",
    email: "divya.kapoor@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "H.O",
    department: "IT Infrastructure & Security",
    designation: "Systems Administrator",
    phone: "+91 97110 10104",
    joinDate: "2023-04-12"
  },
  {
    id: "emp-ho-5",
    empId: "HND-HO-105",
    name: "Gaurav Bhatt",
    email: "gaurav.bhatt@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "H.O",
    department: "Corporate Legal & Compliance",
    designation: "Legal Executive",
    phone: "+91 97110 10105",
    joinDate: "2021-09-01"
  },
  {
    id: "emp-ho-6",
    empId: "HND-HO-106",
    name: "Sneha Mukherjee",
    email: "sneha.mukherjee@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "H.O",
    department: "Supply Chain Management",
    designation: "Procurement Lead",
    phone: "+91 97110 10106",
    joinDate: "2022-11-18"
  },

  // 1F (Factory 1) Employees
  {
    id: "emp-1f-1",
    empId: "HND-1F-201",
    name: "Rohan Kulkarni",
    email: "rohan.kulkarni@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "1F",
    department: "Chassis Assembly Line 1",
    designation: "Senior Assembly Technician",
    phone: "+91 97220 20201",
    joinDate: "2019-05-14"
  },
  {
    id: "emp-1f-2",
    empId: "HND-1F-202",
    name: "Kavita Reddy",
    email: "kavita.reddy@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "1F",
    department: "Quality Assurance & Testing",
    designation: "Quality Inspection Engineer",
    phone: "+91 97220 20202",
    joinDate: "2021-08-22"
  },
  {
    id: "emp-1f-3",
    empId: "HND-1F-203",
    name: "Manish Solanki",
    email: "manish.solanki@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "1F",
    department: "Automated Welding Cell",
    designation: "Robotics Operator",
    phone: "+91 97220 20203",
    joinDate: "2022-02-10"
  },
  {
    id: "emp-1f-4",
    empId: "HND-1F-204",
    name: "Farhan Akhtar",
    email: "farhan.akhtar@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "1F",
    department: "Paint & Anti-Corrosion Shop",
    designation: "Spray Process Specialist",
    phone: "+91 97220 20204",
    joinDate: "2020-10-05"
  },
  {
    id: "emp-1f-5",
    empId: "HND-1F-205",
    name: "Neelam Rajput",
    email: "neelam.rajput@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "1F",
    department: "Facility Maintenance",
    designation: "Electrical Maintenance Officer",
    phone: "+91 97220 20205",
    joinDate: "2023-01-16"
  },
  {
    id: "emp-1f-6",
    empId: "HND-1F-206",
    name: "Harish Chandra",
    email: "harish.chandra@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "1F",
    department: "Material Logistics & Warehouse",
    designation: "Forklift Team Lead",
    phone: "+91 97220 20206",
    joinDate: "2018-12-01"
  },

  // 2F (Factory 2) Employees
  {
    id: "emp-2f-1",
    empId: "HND-2F-301",
    name: "Tanvi Agarwal",
    email: "tanvi.agarwal@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "2F",
    department: "Engine Machining Shop",
    designation: "CNC Milling Specialist",
    phone: "+91 97330 30301",
    joinDate: "2020-04-18"
  },
  {
    id: "emp-2f-2",
    empId: "HND-2F-302",
    name: "Prakash Hegde",
    email: "prakash.hegde@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "2F",
    department: "Transmission Assembly Line",
    designation: "Assembly Line In-Charge",
    phone: "+91 97330 30302",
    joinDate: "2017-09-25"
  },
  {
    id: "emp-2f-3",
    empId: "HND-2F-303",
    name: "Bhavna Mishra",
    email: "bhavna.mishra@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "2F",
    department: "Industrial Safety & Fire Unit",
    designation: "Safety Inspector",
    phone: "+91 97330 30303",
    joinDate: "2022-06-30"
  },
  {
    id: "emp-2f-4",
    empId: "HND-2F-304",
    name: "Abhishek Pandey",
    email: "abhishek.pandey@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "2F",
    department: "Stamping & Press Shop",
    designation: "Hydraulic Press Operator",
    phone: "+91 97330 30304",
    joinDate: "2021-02-14"
  },
  {
    id: "emp-2f-5",
    empId: "HND-2F-305",
    name: "Swati Rathi",
    email: "swati.rathi@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "2F",
    department: "Final Vehicle Inspection",
    designation: "Road Test & PDI Specialist",
    phone: "+91 97330 30305",
    joinDate: "2023-03-09"
  },
  {
    id: "emp-2f-6",
    empId: "HND-2F-306",
    name: "Naveen Kumar",
    email: "naveen.kumar@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "2F",
    department: "Tool & Die Maintenance",
    designation: "Tooling Technician",
    phone: "+91 97330 30306",
    joinDate: "2019-11-20"
  },

  // 3F (Factory 3) Employees
  {
    id: "emp-3f-1",
    empId: "HND-3F-401",
    name: "Karan Johar",
    email: "karan.johar@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "3F",
    department: "Electric Vehicle Battery Pack Unit",
    designation: "High Voltage Battery Technician",
    phone: "+91 97440 40401",
    joinDate: "2022-08-01"
  },
  {
    id: "emp-3f-2",
    empId: "HND-3F-402",
    name: "Ritika Ghosh",
    email: "ritika.ghosh@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "3F",
    department: "Electronics & Sensor Calibration",
    designation: "ECU Calibration Engineer",
    phone: "+91 97440 40402",
    joinDate: "2021-12-15"
  },
  {
    id: "emp-3f-3",
    empId: "HND-3F-403",
    name: "Chetan Bhagat",
    email: "chetan.bhagat@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "3F",
    department: "Body in White (BIW) Line",
    designation: "Laser Welding Specialist",
    phone: "+91 97440 40403",
    joinDate: "2020-03-22"
  },
  {
    id: "emp-3f-4",
    empId: "HND-3F-404",
    name: "Pallavi Soni",
    email: "pallavi.soni@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "3F",
    department: "Inventory & Spare Parts Store",
    designation: "Store Officer",
    phone: "+91 97440 40404",
    joinDate: "2023-05-11"
  },
  {
    id: "emp-3f-5",
    empId: "HND-3F-405",
    name: "Vikas Tyagi",
    email: "vikas.tyagi@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "3F",
    department: "HVAC & Utility Systems",
    designation: "Boiler & Compressor Operator",
    phone: "+91 97440 40405",
    joinDate: "2018-06-19"
  },
  {
    id: "emp-3f-6",
    empId: "HND-3F-406",
    name: "Geeta Basra",
    email: "geeta.basra@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "3F",
    department: "Quality Audit Cell",
    designation: "Internal Quality Auditor",
    phone: "+91 97440 40406",
    joinDate: "2022-04-03"
  },

  // 4F (Factory 4) Employees
  {
    id: "emp-4f-1",
    empId: "HND-4F-501",
    name: "Anil Deshpande",
    email: "anil.deshpande@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "4F",
    department: "Casting & Foundry Shop",
    designation: "Die Casting Master Technician",
    phone: "+91 97550 50501",
    joinDate: "2016-10-12"
  },
  {
    id: "emp-4f-2",
    empId: "HND-4F-502",
    name: "Shalini Dixit",
    email: "shalini.dixit@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "4F",
    department: "Environmental & Waste Management",
    designation: "ETP & STP Plant In-Charge",
    phone: "+91 97550 50502",
    joinDate: "2020-01-29"
  },
  {
    id: "emp-4f-3",
    empId: "HND-4F-503",
    name: "Kamal Hassan",
    email: "kamal.hassan@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "4F",
    department: "Heat Treatment Facility",
    designation: "Furnace Supervisor",
    phone: "+91 97550 50503",
    joinDate: "2019-07-08"
  },
  {
    id: "emp-4f-4",
    empId: "HND-4F-504",
    name: "Monika Sharma",
    email: "monika.sharma@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "4F",
    department: "Dispatch & Yard Logistics",
    designation: "Carrier Dispatch Coordinator",
    phone: "+91 97550 50504",
    joinDate: "2022-10-14"
  },
  {
    id: "emp-4f-5",
    empId: "HND-4F-505",
    name: "Yogesh Mehra",
    email: "yogesh.mehra@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "4F",
    department: "Plant Security & Associate Access",
    designation: "Security Shift Supervisor",
    phone: "+91 97550 50505",
    joinDate: "2021-05-17"
  },
  {
    id: "emp-4f-6",
    empId: "HND-4F-506",
    name: "Tarun Bajaj",
    email: "tarun.bajaj@test.co.in",
    password: "test@password123",
    role: "employee",
    location: "4F",
    department: "Machinery Maintenance",
    designation: "Hydraulics & Pneumatics Engineer",
    phone: "+91 97550 50506",
    joinDate: "2023-02-01"
  }
];

export const initialGrievances = [
  {
    id: "GRV-2026-001",
    ticketNumber: "TEST-HO-2026-001",
    title: "Ergonomic seating & dual monitor request for CAD Modeling Workstations",
    category: "Facilities & Ergonomics",
    location: "H.O",
    specificArea: "R&D Wing B - 3rd Floor",
    priority: "Medium",
    status: "In Progress",
    description: "Designers working on next-gen chassis CAD files are experiencing severe back fatigue due to worn out chairs and single small screens. Requesting standard ergonomic orthopaedic chairs and 27-inch secondary displays.",
    isAnonymous: false,
    submittedBy: {
      id: "emp-ho-2",
      empId: "HND-HO-102",
      name: "Priyanka Sen",
      designation: "Senior Design Engineer",
      department: "R&D Powertrain Systems",
      email: "priyanka.sen@test.co.in"
    },
    assignedTo: {
      id: "admin-ho-1",
      empId: "HND-ADM-HO1",
      name: "Rajeshwar Sharma",
      designation: "Head Office Principal Associate Admin"
    },
    createdAt: "2026-09-10T09:30:00Z",
    updatedAt: "2026-09-12T14:15:00Z",
    remarks: [
      {
        id: "rem-1",
        author: "Rajeshwar Sharma",
        role: "admin",
        message: "Request reviewed with Facilities lead. Purchase order approved for 8 ergonomic mesh chairs and dual monitors. Delivery scheduled for Friday.",
        type: "public",
        timestamp: "2026-09-12T14:15:00Z"
      }
    ],
    timeline: [
      { status: "Submitted", timestamp: "2026-09-10T09:30:00Z", note: "Grievance submitted by employee" },
      { status: "Under Review", timestamp: "2026-09-11T10:00:00Z", note: "Reviewed by H.O Associate Admin Rajeshwar Sharma" },
      { status: "In Progress", timestamp: "2026-09-12T14:15:00Z", note: "Procurement initiated for ergonomic equipment" }
    ]
  },
  {
    id: "GRV-2026-002",
    ticketNumber: "TEST-1F-2026-002",
    title: "Exhaust ventilation fan failure in Body Welding Section 4",
    category: "Workplace Safety & Health",
    location: "1F",
    specificArea: "Welding Shop - Line B, Station 12",
    priority: "High",
    status: "Under Review",
    description: "The primary smoke extraction duct near Station 12 is emitting a grinding noise and extraction suction has dropped by 60%. Fumes are accumulating during MIG welding cycles causing eye irritation to line operators.",
    isAnonymous: false,
    submittedBy: {
      id: "emp-1f-3",
      empId: "HND-1F-203",
      name: "Manish Solanki",
      designation: "Robotics Operator",
      department: "Automated Welding Cell",
      email: "manish.solanki@test.co.in"
    },
    assignedTo: {
      id: "admin-1f-3",
      empId: "HND-ADM-1F3",
      name: "Amitabh Saxena",
      designation: "Plant 1 Associate Admin (General Shift)"
    },
    createdAt: "2026-09-13T08:15:00Z",
    updatedAt: "2026-09-13T11:20:00Z",
    remarks: [
      {
        id: "rem-2",
        author: "Amitabh Saxena",
        role: "admin",
        message: "Maintenance dispatched to inspect the motor bearing on duct #4. Temporary air curtains activated.",
        type: "public",
        timestamp: "2026-09-13T11:20:00Z"
      }
    ],
    timeline: [
      { status: "Submitted", timestamp: "2026-09-13T08:15:00Z", note: "Grievance logged by Plant 1 operator" },
      { status: "Under Review", timestamp: "2026-09-13T11:20:00Z", note: "Assigned to Safety Associate Admin Amitabh Saxena" }
    ]
  },
  {
    id: "GRV-2026-003",
    ticketNumber: "TEST-2F-2026-003",
    title: "Delayed overtime shift allowance calculation for August billing cycle",
    category: "Payroll & Compensation",
    location: "2F",
    specificArea: "Plant 2 Engine Assembly Hall",
    priority: "Medium",
    status: "Resolved",
    description: "The night shift differential and Sunday overtime hours worked between Aug 15 and Aug 28 were not reflected in the September 1st pay stub for 14 associates.",
    isAnonymous: false,
    submittedBy: {
      id: "emp-2f-2",
      empId: "HND-2F-302",
      name: "Prakash Hegde",
      designation: "Assembly Line In-Charge",
      department: "Transmission Assembly Line",
      email: "prakash.hegde@test.co.in"
    },
    assignedTo: {
      id: "admin-2f-1",
      empId: "HND-ADM-2F1",
      name: "Meenakshi Iyer",
      designation: "Plant 2 Associate Admin (Lead)"
    },
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-09-05T16:45:00Z",
    remarks: [
      {
        id: "rem-3",
        author: "Meenakshi Iyer",
        role: "admin",
        message: "Discrepancy verified with biometric attendance logs. Supplementary payout processed directly to associates accounts on Sept 5th.",
        type: "public",
        timestamp: "2026-09-05T16:45:00Z"
      }
    ],
    timeline: [
      { status: "Submitted", timestamp: "2026-09-02T10:00:00Z", note: "Logged by Prakash Hegde" },
      { status: "Under Review", timestamp: "2026-09-03T09:00:00Z", note: "Reconciled with Payroll Dept" },
      { status: "In Progress", timestamp: "2026-09-04T11:30:00Z", note: "Supplemental payroll batch created" },
      { status: "Resolved", timestamp: "2026-09-05T16:45:00Z", note: "Payment disbursed and confirmed with bank" }
    ]
  },
  {
    id: "GRV-2026-004",
    ticketNumber: "TEST-3F-2026-004",
    title: "Need for specialized insulated rubber matting around High-Voltage EV Test Benches",
    category: "Workplace Safety & Health",
    location: "3F",
    specificArea: "EV Battery Pack Assembly & Calibration Bay",
    priority: "Critical",
    status: "In Progress",
    description: "With voltage tests exceeding 400V DC on the new EV pack line, current standard ESD mats are inadequate. We require Class 2 (17,000V rated) dielectric insulating floor mats as per ISO/OSHA standards immediately.",
    isAnonymous: false,
    submittedBy: {
      id: "emp-3f-1",
      empId: "HND-3F-401",
      name: "Karan Johar",
      designation: "High Voltage Battery Technician",
      department: "Electric Vehicle Battery Pack Unit",
      email: "karan.johar@test.co.in"
    },
    assignedTo: {
      id: "admin-3f-1",
      empId: "HND-ADM-3F1",
      name: "Ananya Roy Chowdhury",
      designation: "Plant 3 Associate Admin (Senior)"
    },
    createdAt: "2026-09-12T07:45:00Z",
    updatedAt: "2026-09-14T15:10:00Z",
    remarks: [
      {
        id: "rem-4",
        author: "Ananya Roy Chowdhury",
        role: "admin",
        message: "High priority safety order expedited with 3M India. Certified Class 2 dielectric mats arrived on site today; safety technician installing them before tomorrow morning shift.",
        type: "public",
        timestamp: "2026-09-14T15:10:00Z"
      }
    ],
    timeline: [
      { status: "Submitted", timestamp: "2026-09-12T07:45:00Z", note: "Submitted with Critical priority tag" },
      { status: "Under Review", timestamp: "2026-09-12T08:30:00Z", note: "Fast-tracked by Plant 3 Admin Ananya Roy" },
      { status: "In Progress", timestamp: "2026-09-13T10:00:00Z", note: "Procured 3M certified dielectric mats" }
    ]
  },
  {
    id: "GRV-2026-005",
    ticketNumber: "TEST-4F-2026-005",
    title: "Canteen food temperature and water cooler filtration in Foundry Wing",
    category: "Facilities & Welfare",
    location: "4F",
    specificArea: "Plant 4 Canteen Annex & Foundry Rest Area",
    priority: "Low",
    status: "Submitted",
    description: "The second floor water purification filter indicator has turned red and the water has an odd metallic taste. Also during Shift 2 dinner, food is often cold by 8:30 PM.",
    isAnonymous: true,
    submittedBy: {
      id: "emp-4f-1",
      empId: "HND-4F-501",
      name: "Confidential Associate",
      designation: "Foundry Plant Associate",
      department: "Casting & Foundry Shop",
      email: "anonymous@test.co.in"
    },
    assignedTo: {
      id: "admin-4f-1",
      empId: "HND-ADM-4F1",
      name: "Deepak Joshi",
      designation: "Plant 4 Sole Associate Admin"
    },
    createdAt: "2026-09-14T18:20:00Z",
    updatedAt: "2026-09-14T18:20:00Z",
    remarks: [],
    timeline: [
      { status: "Submitted", timestamp: "2026-09-14T18:20:00Z", note: "Grievance submitted anonymously" }
    ]
  }
];
