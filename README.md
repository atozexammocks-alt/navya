# NAVYA — Institute OS

NAVYA is being built as a multi-tenant education platform for schools, coaching institutes, colleges, universities, training centres and individual educators.

## Product vision

NAVYA combines:

- Institute ERP
- Exam Platform
- Question Bank
- Teacher Workspace
- Student Portal
- Parent Portal
- Analytics
- AI Tools
- Communication
- Finance
- Reports

## Core architecture

### NAVYA CORE
- Authentication
- Organizations / tenants
- Users & roles
- Permissions
- Tenant isolation
- Audit logs
- Settings

### ACADEMIC CORE
- Students
- Teachers
- Classes / batches
- Subjects
- Question Bank
- Library
- Test Builder
- Paper Designer
- Online Exams
- Results

### INSTITUTE OPERATIONS
- Attendance
- Timetable
- Homework
- Assignments
- Admissions / CRM
- Communication
- Finance
- HR
- Documents

### ADVANCED
- AI tools
- Analytics
- Courses
- Marketplace
- Mobile apps
- Integrations

## Storage strategy

- Structured data belongs in the application database.
- PDFs and images use object/file storage.
- Videos are not required to be stored on NAVYA initially.
- Institutes can add supported external video links (for example YouTube) and NAVYA can display them inside its video library/player.
- A future premium video-storage option can be added without changing the core product model.
- Backups / external storage integrations can be added later.

## Multi-tenant rule

Every organization owns its own data. Organization A must never be able to read Organization B's private data.

This rule applies to:

- students
- teachers
- questions
- libraries
- files
- tests
- results
- fees
- documents
- analytics
- communication

## Initial build principle

Do not copy the old A-to-Z Exam Mocks HTML files directly into this repository.

Build the secure foundation first, then migrate useful modules such as the Question Bank, PDF Slicer, AI Uploader, Test Builder and Paper Designer into NAVYA's Academic Core.

## Initial development order

1. Project shell
2. Authentication
3. Organization creation
4. Roles and permissions
5. Tenant isolation
6. Database schema
7. Institute dashboard
8. Teacher / student management
9. Library and Question Bank
10. Test Builder + Paper Designer
11. Online Exam + Results
12. Operations modules
13. AI + Analytics
14. Marketplace / integrations

## Deployment

The repository is intentionally designed so it can be connected to Vercel later. Development should remain usable on the free tiers while NAVYA is small; paid infrastructure should be introduced only when real usage requires it.
