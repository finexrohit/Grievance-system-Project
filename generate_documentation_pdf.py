import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#CC0000"))
            self.drawString(40, 760, "HONDA MOTORCYCLES & SCOOTERS INDIA (HMSI)")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(572, 760, "Internal Grievance Redressal System — Technical Documentation")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(40, 752, 572, 752)
        
        # Footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(40, 42, 572, 42)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 28, "Confidential — For Internal & Internship Evaluation Only")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 28, page_str)
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    HONDA_RED = colors.HexColor("#CC0000")
    SLATE_DARK = colors.HexColor("#0F172A")
    SLATE_TEXT = colors.HexColor("#334155")
    SLATE_LIGHT = colors.HexColor("#F8FAFC")
    BORDER_COLOR = colors.HexColor("#CBD5E1")
    BRAND_ACCENT = colors.HexColor("#991B1B")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=SLATE_DARK,
        alignment=0
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#475569")
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=HONDA_RED,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SLATE_DARK,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=SLATE_TEXT,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1E293B")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=SLATE_TEXT
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#991B1B")
    )

    story = []

    # -------------------------------------------------------------
    # COVER / HEADER BANNER
    # -------------------------------------------------------------
    banner_data = [
        [
            Paragraph("<b>HONDA REDRESSAL SYSTEM</b><br/><font size='8' color='#94A3B8'>ENTERPRISE ASSOCIATE & ADMIN MANAGEMENT</font>", ParagraphStyle('HdrLeft', parent=styles['Normal'], textColor=colors.white, fontName='Helvetica-Bold', fontSize=12, leading=14)),
            Paragraph("<b>OFFICIAL TECHNICAL DOCUMENTATION</b><br/><font size='8' color='#CBD5E1'>Honda Internship Project</font>", ParagraphStyle('HdrRight', parent=styles['Normal'], textColor=colors.white, fontName='Helvetica', fontSize=9, leading=12, alignment=2))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[332, 200])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HONDA_RED),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 14))

    # Document Title
    story.append(Paragraph("Full System Architecture, End-to-End Workflow & Codebase Mapping", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Comprehensive guide covering authentication, ticket lifecycle, SLA escalation, MySQL database schema, and source file locations.", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=10))

    # Executive Overview Callout
    overview_text = (
        "<b>Executive Summary:</b> The Honda Grievance Redressal System is a full-stack, enterprise-grade web application "
        "engineered for Honda manufacturing plants (H.O, 1F Manesar, 2F Tapukara, 3F Narsapura, 4F Vithalapur). "
        "It provides plant-level routing, tamper-proof location binding, multi-stage investigation workflows, automated SLA tracking, "
        "Head Office escalations, and interactive analytical reporting."
    )
    callout_data = [[Paragraph(overview_text, callout_style)]]
    callout_table = Table(callout_data, colWidths=[532])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('LINELEFT', (0,0), (-1,-1), 4, HONDA_RED),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 1: SYSTEM ARCHITECTURE
    # -------------------------------------------------------------
    story.append(Paragraph("1. Technical Stack & System Architecture", h1_style))
    story.append(Paragraph(
        "The system employs a high-performance 3-tier architecture with a decoupled React SPA frontend, an Express.js REST API server, and a MySQL relational database.",
        body_style
    ))

    tech_table_data = [
        [Paragraph("Tier / Layer", table_header_style), Paragraph("Technology", table_header_style), Paragraph("Key Role & Responsibility", table_header_style)],
        [Paragraph("Frontend Client", body_bold), Paragraph("React 18 + Vite + Tailwind CSS", table_cell_style), Paragraph("Single Page Application (SPA), responsive UI, role-based dashboards, interactive charts & forms.", table_cell_style)],
        [Paragraph("Backend API", body_bold), Paragraph("Node.js + Express.js", table_cell_style), Paragraph("REST API endpoints, session handling, business logic, SLA evaluation, validation, security logging.", table_cell_style)],
        [Paragraph("Database Layer", body_bold), Paragraph("MySQL (mysql2 pool)", table_cell_style), Paragraph("Relational storage for 40+ employees/admins, grievances, audit logs, comments, and OTP credentials.", table_cell_style)],
        [Paragraph("Build & Bundler", body_bold), Paragraph("Vite 5", table_cell_style), Paragraph("High-speed asset compilation, tree-shaking, production builds output directly to client/dist.", table_cell_style)]
    ]
    tech_table = Table(tech_table_data, colWidths=[110, 150, 272])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, SLATE_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 2: END-TO-END WORKFLOW
    # -------------------------------------------------------------
    story.append(Paragraph("2. Complete End-to-End System Workflow", h1_style))
    story.append(Paragraph("The grievance lifecycle follows a structured 7-step enterprise path from submission to closure:", body_style))

    steps_data = [
        ("Step 1: Role-Based Authentication", 
         "Associates and Admins log in using their Employee ID / Email and Password on the Login Page. The system verifies credentials against the MySQL database and establishes an authenticated session with user profile and assigned plant location."),
        
        ("Step 2: Auto-Detected Grievance Submission", 
         "When an associate lodges a grievance, the system automatically detects their registered plant location (H.O, 1F, 2F, 3F, 4F) and locks it. Manual plant tampering is prevented on both frontend and backend. The associate specifies category, area, priority, description, attachment, and optional anonymity."),
        
        ("Step 3: Sequential Ticket ID & Plant Routing", 
         "Upon submission, the backend automatically generates a sequential ticket code (e.g. HONDA-1F-2026-008), auto-assigns the ticket to the designated Plant Associate Admin, and creates the first timeline audit log."),
        
        ("Step 4: Admin Investigation & Status Progression", 
         "The assigned Plant Admin opens the ticket in the Admin Dashboard to review evidence, write investigation notes, post public or internal comments, and update status through: Submitted -> Under Review -> In Progress -> Resolved -> Closed."),
        
        ("Step 5: Automated SLA Tracking & H.O Escalation", 
         "Each ticket is governed by priority SLAs (Urgent: 24h, High: 48h, Normal: 5 days). If an unresolved ticket breaches its SLA or requires executive intervention, it is escalated to Head Office (H.O) Global Admins."),
        
        ("Step 6: Resolution, Feedback & Audit Trail", 
         "When resolved, the associate receives resolution remarks, can review the complete chronological action timeline, and submit feedback. All actions are immutably recorded in activity_logs."),
        
        ("Step 7: Analytics & Employee Directory", 
         "Executive admins monitor plant-wise performance, average turnaround time (TAT), category distributions, and search the plant associate directory.")
    ]

    for title, desc in steps_data:
        p_step = Paragraph(f"<b>{title}</b><br/>{desc}", body_style)
        step_box = Table([[p_step]], colWidths=[532])
        step_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LINELEFT', (0,0), (-1,-1), 3, HONDA_RED),
        ]))
        story.append(step_box)
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # SECTION 3: WHERE & HOW DATA IS STORED (DATABASE SCHEMA)
    # -------------------------------------------------------------
    story.append(Paragraph("3. Database Schema & Storage Architecture", h1_style))
    story.append(Paragraph(
        "All data is persistently stored in a relational <b>MySQL Database</b> named <code>honda_grievance_db</code> running on port 3306. "
        "The server utilizes pooled connections for high concurrency and zero memory leaks.",
        body_style
    ))

    schema_data = [
        [Paragraph("Table Name", table_header_style), Paragraph("Description", table_header_style), Paragraph("Key Columns & Types", table_header_style)],
        
        [Paragraph("users", code_style), 
         Paragraph("User accounts (Associates, Plant Admins, HO Global Admins)", table_cell_style),
         Paragraph("id (PK), emp_id (UNIQUE), name, email (UNIQUE), password_hash, role ('associate'|'admin'), location ('H.O'|'1F'..'4F'), department, designation, phone, is_global_admin", table_cell_style)],
        
        [Paragraph("grievances", code_style), 
         Paragraph("Official grievance tickets with status and routing info", table_cell_style),
         Paragraph("id (PK), ticket_number (UNIQUE), title, category, location, specific_area, priority ('low'|'medium'|'high'|'urgent'), status ('submitted'|'under_review'|'in_progress'|'resolved'|'closed'), description, attachment_url, is_anonymous, escalated_to_ho, submitted_by_id (FK), assigned_to_id (FK), resolution_notes, created_at, updated_at", table_cell_style)],
        
        [Paragraph("comments", code_style), 
         Paragraph("Conversation thread and internal admin investigation notes", table_cell_style),
         Paragraph("id (PK), grievance_id (FK), author_id (FK), message, is_internal (0|1), created_at", table_cell_style)],
        
        [Paragraph("timeline_events", code_style), 
         Paragraph("Chronological audit log of ticket status transitions", table_cell_style),
         Paragraph("id (PK), grievance_id (FK), type, description, performed_by_id (FK), created_at", table_cell_style)],
        
        [Paragraph("activity_logs", code_style), 
         Paragraph("System-wide security and access audit trail", table_cell_style),
         Paragraph("id (PK), user_id (FK), action, details, ip_address, created_at", table_cell_style)],
        
        [Paragraph("otp_codes", code_style), 
         Paragraph("Time-bound verification tokens for self-service password reset", table_cell_style),
         Paragraph("id (PK), emp_id, code, email, expires_at", table_cell_style)]
    ]

    schema_table = Table(schema_data, colWidths=[85, 145, 302])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, SLATE_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(schema_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 4: FILE AND CODEBASE MAPPING
    # -------------------------------------------------------------
    story.append(Paragraph("4. Source Code & File Location Reference", h1_style))
    story.append(Paragraph("Direct mapping of where every feature and function is implemented in the repository:", body_style))

    files_data = [
        [Paragraph("File Path", table_header_style), Paragraph("Layer", table_header_style), Paragraph("Key Features & Functions Written in this File", table_header_style)],
        
        [Paragraph("client/src/pages/<br/>LoginPage.jsx", code_style), Paragraph("Frontend", table_cell_style), 
         Paragraph("Employee/Admin login interface, credential input validation, and <b>Download Credentials Button</b> for the 40 test accounts.", table_cell_style)],
        
        [Paragraph("client/src/pages/<br/>SubmitGrievanceModal.jsx", code_style), Paragraph("Frontend", table_cell_style), 
         Paragraph("Grievance submission form with <b>auto-detected plant location display</b> (no manual selector), file attachment upload, and priority flags.", table_cell_style)],
        
        [Paragraph("client/src/pages/<br/>EmployeeDashboard.jsx", code_style), Paragraph("Frontend", table_cell_style), 
         Paragraph("Associate workspace showing lodged grievances, real-time status trackers, SLA badges, and quick submission action button.", table_cell_style)],
        
        [Paragraph("client/src/pages/<br/>AdminDashboard.jsx", code_style), Paragraph("Frontend", table_cell_style), 
         Paragraph("Admin workbench with plant/status/priority filters, search, quick stats cards, and ticket management actions.", table_cell_style)],
        
        [Paragraph("client/src/pages/<br/>GrievanceDetailModal.jsx", code_style), Paragraph("Frontend", table_cell_style), 
         Paragraph("Ticket investigation view, status updater dropdown, internal notes toggle, conversation chat, and timeline audit logs.", table_cell_style)],
        
        [Paragraph("client/src/pages/<br/>AnalyticsPage.jsx", code_style), Paragraph("Frontend", table_cell_style), 
         Paragraph("Interactive metrics dashboard: SLA resolution rate, plant-by-plant grievance breakdown, category distributions.", table_cell_style)],
        
        [Paragraph("client/src/pages/<br/>DirectoryPage.jsx", code_style), Paragraph("Frontend", table_cell_style), 
         Paragraph("Plant-wise Associate & Administrator directory with instant search and contact information cards.", table_cell_style)],
        
        [Paragraph("client/src/pages/<br/>ForgotPasswordPage.jsx", code_style), Paragraph("Frontend", table_cell_style), 
         Paragraph("3-Step OTP password reset workflow: Request OTP -> Verify OTP code -> Set new password.", table_cell_style)],
        
        [Paragraph("server/server.js", code_style), Paragraph("Backend", table_cell_style), 
         Paragraph("Express REST API server: Authentication endpoints (<code>/api/auth/*</code>), grievance CRUD (<code>/api/grievances/*</code>), analytics (<code>/api/analytics/*</code>), CORS & static file hosting.", table_cell_style)],
        
        [Paragraph("server/db.js", code_style), Paragraph("Backend / DB", table_cell_style), 
         Paragraph("MySQL connection pool, automatic table schema initialization (<code>initDB()</code>), demo seed data generator (40 users + grievances), and all SQL query handlers (<code>createGrievance()</code>, <code>findUserByCredentials()</code>, <code>updateGrievance()</code>, etc.).", table_cell_style)],
        
        [Paragraph("server/.env", code_style), Paragraph("Config", table_cell_style), 
         Paragraph("Database configuration environment variables (<code>DB_HOST</code>, <code>DB_USER</code>, <code>DB_PASSWORD</code>, <code>DB_NAME</code>, <code>PORT</code>).", table_cell_style)]
    ]

    files_table = Table(files_data, colWidths=[120, 52, 360])
    files_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, SLATE_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(files_table)
    story.append(Spacer(1, 14))

    # Footer note
    story.append(Paragraph(
        "<b>Note on Data Security:</b> Passwords in production are salted and hashed. Plant boundaries are strictly enforced so that Plant Admins only access grievances belonging to their facility, while HO Admins maintain global oversight.",
        ParagraphStyle('SecurityNote', parent=body_style, fontSize=8, textColor=colors.HexColor("#64748B"))
    ))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == "__main__":
    out_file = r"c:\Users\rohit\Desktop\Projects\Honda Internship\Greivance System\Honda_Grievance_Redressal_System_Documentation.pdf"
    build_pdf(out_file)
