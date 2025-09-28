# Product Requirements Document: GenKit ProStudio

**Version:** 1.0
**Date:** 2024-08-01
**Author:** AI Assistant (Gemini)

---

## 1. Introduction

### 1.1. Project Vision
GenKit Pro Studio is an all-in-one SaaS platform for colleges that enables structured management of student academic projects. By digitizing the project lifecycle—from team formation, abstract submission, faculty assignment, approvals, to final reporting—the platform fosters innovation, reduces faculty workload, and ensures transparent, department-wise project tracking.

The platform integrates AI-powered features to summarize abstracts, assist in issue resolution, and streamline communication, ensuring both students and faculty have a seamless experience.

### 1.2. Purpose of this Document
This document defines the product requirements for GenKit Pro Studio. It captures:
- The needs of students, faculty, and administrators.
- Core features and technical requirements.
- Data models and workflows.
- AI-driven enhancements.

This serves as the single source of truth for designers, developers, and stakeholders.

### 1.3. Target Audience
The platform is designed for multiple stakeholders within colleges:
- **Students** (project creators & team members)
- **Guides/Internal Faculty**
- **HoDs** (Heads of Departments)
- **R&D Coordinators**
- **External Faculty** (Evaluators)
- **Admins** (Super Admin & Sub Admin/College Admins)

---

## 2. Goals and Objectives

### 2.1. Business Goals
- **Streamline Academic Project Management:** Eliminate manual workflows and paperwork.
- **Ensure Transparent Approvals:** Multi-level approval system with real-time status tracking.
- **Enhance Student Collaboration:** Easy team creation, task assignment, and communication.
- **Reduce Faculty Burden:** AI-assisted summaries, evaluation tools, and auto-reporting.
- **Enable Department-Wise Insights:** Analytics, scoring trends, and downloadable reports.

### 2.2. Success Metrics
- % reduction in faculty workload during project approvals and evaluations.
- Number of projects successfully approved and completed via the platform.
- Average student satisfaction score (via in-app feedback).
- Usage rate of AI features (summaries, support triage, auto responses).
- Adoption rate across colleges and departments.

---

## 3. User Roles & Features

### 3.1. User Personas

#### 3.1.1. Student (e.g., "Ravi")
- **Needs:** Register with personal details, form a team, submit abstracts, track approvals, tag members by skill, and get evaluations.
- **Pain Points:** Confusing approval stages, difficulty forming teams, lack of feedback on rejected projects.

#### 3.1.2. Guide (e.g., "Dr. Priya")
- **Needs:** View assigned teams, check abstracts with AI-generated summaries, approve/reject projects, provide remarks, and assign preliminary marks.
- **Pain Points:** Reviewing large volumes of documents manually, tracking multiple student teams.

#### 3.1.3. R&D Coordinator (e.g., "Mr. Arjun")
- **Needs:** Review projects forwarded by guides, approve/reject, interact with students, and escalate approvals to HoD.
- **Pain Points:** Manual coordination with guides and HoDs, lack of structured reporting.

#### 3.1.4. HoD (e.g., "Prof. Meena")
- **Needs:** Approve final projects, assign external faculty, track departmental projects, download lists/reports.
- **Pain Points:** Difficulty tracking status across sections, time-consuming report preparation.

#### 3.1.5. External Faculty (e.g., "Mr. Sharma")
- **Needs:** Evaluate assigned projects, score teams/individuals, view reports, and provide feedback.
- **Pain Points:** Disorganized project information, lack of evaluation standardization.

#### 3.1.6. Admin (Super + Sub Admin)
- **Needs:** Super Admin manages platform-wide data. Sub Admin (college-level) manages users, departments, HoDs, and guides.
- **Pain Points:** Manual student and faculty assignment, scattered data across spreadsheets.

### 3.2. Feature Matrix

| Feature                   | Student | Guide | R&D | HoD | External Faculty | Admin | Description                                                                      |
| ------------------------- | :-----: | :---: | :-: | :-: | :--------------: | :---: | -------------------------------------------------------------------------------- |
| User Authentication       |    ✅    |  ✅   |  ✅ |  ✅ |        ✅        |  ✅   | Secure login/signup (Google/Email), forgot password, role-based dashboards.    |
| College & Dept Selection  |    ✅    |  ✅   |  ✅ |  ✅ |        ✅        |  ✅   | Users select their college & department for context-specific portal.             |
| Profile Management        |    ✅    |  ✅   |  -  |  -  |        -         |  ✅   | Students add Roll No, skills, GitHub/LinkedIn; faculty update basic info.        |
| Team Management           |    ✅    |   -   |  -  |  -  |        -         |  ✅   | Create/join teams (max 6), invite by link/code, assign member roles.             |
| Project Submission        |    ✅    |  ✅   |  ✅ |  ✅ |        ✅        |  ✅   | Students submit abstracts, docs, deployed link; guides & HoDs review.            |
| Approval Workflow         |    -    |  ✅   |  ✅ |  ✅ |        -         |  ✅   | Multi-level approvals: Guide → R&D → HoD.                                      |
| Evaluation & Scoring      |    -    |  ✅   |  -  |  ✅ |        ✅        |  ✅   | Guides & external faculty assign marks (team + individual).                        |
| AI Abstract Summarizer    |    ✅    |  ✅   |  ✅ |  ✅ |        ✅        |   -   | Summarizes project abstracts for faster reviews.                               |
| AI Issue Support          |    ✅    |  ✅   |  ✅ |  ✅ |        -         |  ✅   | Students submit issues → AI triages → faculty/admin respond.                     |
| Discussion/Remarks Tab    |    ✅    |  ✅   |  ✅ |  ✅ |        -         |   -   | Chat-like interface for feedback & clarifications.                               |
| Announcements             |    ✅    |  ✅   |  ✅ |  ✅ |        ✅        |  ✅   | Broadcast updates with start/end dates.                                        |
| Reports & Downloads       |    -    |  ✅   |  ✅ |  ✅ |        ✅        |  ✅   | Export CSV/Excel lists of students, teams, projects, scores.                     |
| Analytics Dashboard       |    -    |  ✅   |  ✅ |  ✅ |        ✅        |  ✅   | Visual insights: team distribution, workload, project progress.                  |

---

## 4. Technical Specifications

### 4.1. Tech Stack
- **Frontend Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + ShadCN UI components
- **AI Layer:** Genkit + Google Gemini models
- **Database & Auth:** Firebase (Firestore, Auth)
- **File Storage:** Firebase Storage (for abstracts, reports, docs)

### 4.2. Data Models (Simplified)

#### `College`
- `id`: string
- `name`: string
- `departments`: `Department[]`

#### `User`
- `id`: string
- `role`: 'student' | 'guide' | 'hod' | 'rnd' | 'external' | 'admin'
- `name`: string
- `email`: string
- `rollNo`: string (students only)
- `skills`: string[]
- `github`: string
- `linkedin`: string
- `notifications`: `Notification[]`

#### `Team`
- `id`: string
- `name`: string
- `creatorId`: string
- `joinCode`: string
- `members`: `Member[]`
- `projects`: `Project[]`

#### `Project`
- `id`: string
- `teamId`: string
- `title`: string
- `description`: string
- `abstractFileUrl`: string
- `githubUrl`: string
- `deployedUrl`: string
- `status`: 'PendingGuide' | 'PendingR&D' | 'PendingHoD' | 'Approved' | 'Rejected'
- `scores`: `Score[]`

#### `Evaluation`
- `id`: string
- `projectId`: string
- `evaluatorId`: string
- `marks`: number
- `remarks`: string

#### `SupportTicket`
- `id`: string
- `studentId`: string
- `subject`: string
- `description`: string
- `status`: 'New' | 'In Progress' | 'Resolved'
- `priority`: 'Low' | 'Medium' | 'High'
- `responses`: `Response[]`

### 4.3. AI Integration (Genkit Flows)
- **`summarize-abstract`**: Generates summaries of student abstracts.
- **`triage-support-ticket`**: Categorizes and prioritizes student issues.
- **`generate-support-draft`**: Suggests draft responses for faculty.
- **`auto-project-status`**: Predicts likely project outcome (experimental).
- **`analytics-helper`**: Creates auto-insights for faculty dashboards.