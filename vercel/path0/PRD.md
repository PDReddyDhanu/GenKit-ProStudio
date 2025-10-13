# Product Requirements Document: GenKit ProStudio

**Version:** 2.0
**Date:** 2024-08-02
**Author:** AI Assistant (Gemini)

---

## 1. Introduction

### 1.1. Project Vision
To create an all-in-one, AI-enhanced SaaS platform that digitizes and streamlines the entire academic project lifecycle for colleges. GenKit ProStudio will foster innovation, reduce administrative overhead for faculty, and provide a transparent, structured, and collaborative environment for students.

### 1.2. Purpose of this Document
This document provides a comprehensive definition of the product requirements for GenKit ProStudio. It is the single source of truth for all stakeholders, including designers, developers, and project managers. It details user roles, feature specifications, technical architecture, data models, and success metrics.

### 1.3. Target Audience
The platform serves multiple stakeholders within a college ecosystem:
-   **Students:** The primary users, responsible for creating teams and submitting projects.
-   **Faculty (Guides/Mentors):** Responsible for reviewing, guiding, and evaluating student projects.
-   **Department Heads (HoDs):** Responsible for final approvals, assigning external evaluators, and departmental oversight.
-   **R&D Coordinators:** An intermediate approval and coordination layer between Guides and HoDs.
-   **External Faculty:** Industry experts or academics invited to evaluate final projects.
-   **Administrators (Super Admin & College Admin):** Responsible for platform and user management.

---

## 2. Goals and Objectives

### 2.1. Business Goals
-   **Efficiency:** Drastically reduce the manual effort and paperwork involved in managing academic projects.
-   **Transparency:** Provide real-time visibility into project status for all stakeholders through a multi-level approval system.
-   **Collaboration:** Empower students with tools for easy team formation, communication, and role assignment.
-   **Faculty Empowerment:** Reduce faculty workload through AI-driven abstract summarization, support ticket triage, and automated reporting.
-   **Data-Driven Insights:** Enable HoDs and Admins to access departmental analytics, scoring trends, and exportable reports.

### 2.2. Success Metrics
-   **Faculty Workload Reduction:** Target a 30% reduction in time spent by faculty on project-related administrative tasks per semester.
-   **Platform Adoption:** Achieve 95% adoption among final-year students for project submissions within the first year of implementation.
-   **Student Satisfaction:** Maintain an average student satisfaction score of 4.5/5.0, measured via in-app surveys.
-   **AI Feature Usage:** See over 70% of project reviews utilizing the AI abstract summarizer.
-   **Approval Time:** Reduce the average project approval time from submission to final approval by 40%.

---

## 3. User Roles, Personas, and Journeys

### 3.1. User Personas

#### 3.1.1. Student ("Ravi")
-   **Needs:** A simple way to form a team, submit his project idea with a GitHub repo, see if it's approved, and get clear feedback on his work.
-   **Pain Points:** Disorganized communication with guides, unclear approval status, difficulty finding teammates with the right skills.

#### 3.1.2. Guide ("Dr. Priya")
-   **Needs:** An organized dashboard of her assigned teams, quick summaries of project abstracts, and a simple interface to approve/reject projects and leave remarks.
-   **Pain Points:** Managing a high volume of lengthy project documents, tracking feedback for multiple teams simultaneously.

#### 3.1.3. HoD ("Prof. Meena")
-   **Needs:** A high-level view of all projects in her department, the ability to give final sign-off, assign external evaluators, and download reports for accreditation purposes.
-   **Pain Points:** Lack of a centralized system for tracking departmental projects, manual compilation of reports.

### 3.2. User Journeys

#### 3.2.1. Student Project Submission Journey
1.  **Registration:** Ravi signs up on the platform using his college email and selects his department and branch.
2.  **Profile Completion:** He completes his profile, adding his skills (e.g., React, Node.js) and work style preferences.
3.  **Team Formation:** Ravi creates a team named "CodeWizards" and gets a unique join code. He shares it with his friends, who use it to join the team.
4.  **Project Ideation:** The team uses the **AI Idea Generator** to brainstorm concepts related to "AI in Healthcare".
5.  **Submission:** Ravi, as the team leader, submits their project proposal, including a detailed abstract, a link to their GitHub repository, and an optional PDF document.
6.  **Status Tracking:** The team dashboard shows the project status as "Pending Guide Approval."
7.  **Feedback & Approval:** Dr. Priya (Guide) rejects the initial idea with remarks. Ravi's team gets a notification, revises the abstract, and resubmits. Dr. Priya approves it. The status changes to "Pending R&D Approval."
8.  **Final Approval:** The project passes through R&D and HoD approvals. The status is now "Approved."
9.  **Evaluation:** After completion, the project is scored by both internal and external faculty. Ravi can view the team's final score and download a certificate.

#### 3.2.2. Faculty Approval Journey
1.  **Login:** Dr. Priya logs into the Faculty Portal.
2.  **Dashboard:** Her dashboard shows "5 Projects Pending Review."
3.  **Review:** She clicks on a project from "CodeWizards." She reads the **AI-generated summary** of the abstract first to get a quick overview.
4.  **Detailed Review:** She then reviews the full abstract and the linked GitHub repository.
5.  **Decision:** She finds the scope too broad and clicks "Reject." A dialog box appears, prompting her for remarks. She types, "The scope is too ambitious for a semester-long project. Please refine the feature list and resubmit."
6.  **Notification:** The students are notified of the rejection and her remarks.
7.  **Re-review:** After the students resubmit, she gets a new notification. She reviews the changes and is satisfied.
8.  **Approval:** She clicks "Approve." The project is automatically forwarded to the R&D Coordinator's queue, and its status is updated.

---

## 4. Detailed Feature Specifications

### 4.1. User Management & Authentication
-   **Registration:** Separate signup flows for Students and Faculty.
    -   **Student:** Requires Name, Email, Password, Roll No, Department, Branch, Section.
    -   **Faculty:** Requires Name, Email, Password, Role (Guide, HoD, etc.), Department.
-   **Login:** Secure email/password login. A "Main Admin" has a separate, hardcoded login. College-level admins (Sub-Admins) log in through the faculty portal.
-   **User Approval:** New student and faculty registrations enter a "pending" state and must be approved by a College Admin from their dashboard.
-   **Profile Management:**
    -   **Student:** Can edit name, skills, bio, GitHub/LinkedIn links, and work style preferences.
    -   **Faculty:** Can edit name, bio, and contact information.

### 4.2. Team Management
-   **Team Creation:** An approved student can create a team for a selected project event, which auto-generates a unique 6-character alphanumeric join code. The creator becomes the team leader by default.
-   **Joining a Team:** Students can join a team by entering the join code, which sends a request to the team leader.
-   **Request Management:** Team leaders can view and accept/reject join requests from their dashboard.
-   **Team Roles:** The team leader can assign specific roles (e.g., Frontend Dev, UI/UX Designer, Presenter) to members.
-   **Team Hub:** A dedicated space for each team with a chat for internal communication, a separate chat for communication with the assigned guide, and a list of members.

### 4.3. Project Submission & Approval Workflow
-   **Multi-Idea Submission:** Teams can submit up to 3 project ideas per project event.
-   **Submission Form:** Includes fields for Project Title, Description, Abstract (rich text), Keywords, GitHub URL, and an optional Abstract Document upload (PDF).
-   **Approval Flow:** A strict, multi-level workflow:
    1.  **`PendingGuide`**: Submitted project appears in the assigned Guide's queue.
    2.  **`PendingR&D`**: If approved by Guide, it moves to the R&D Coordinator's queue.
    3.  **`PendingHoD`**: If approved by R&D, it moves to the HoD's queue for final approval.
    4.  **`Approved`**: After HoD approval, the project is officially greenlit.
    5.  **`Rejected`**: At any stage, the project can be rejected. A remark is mandatory for rejection. The team is notified and can resubmit.
-   **Status History:** The entire approval journey, including who approved/rejected it, when, and with what remarks, is tracked and visible to the student team.

### 4.4. Evaluation & Scoring
-   **Rubrics:** A standardized set of rubrics for different evaluation stages (Internal Stage 1, Internal Final, External Final) and for individual contributions.
-   **Scoring Interface:** Faculty get a dedicated interface to score projects. They can input scores for each criterion using a slider and add comments.
-   **Dual Scoring:** Final evaluation includes scores from both an internal guide and an assigned external faculty member.
-   **Individual Scoring:** In the final stage, faculty also score each team member individually based on contribution and teamwork.
-   **Score Calculation:** The system automatically calculates the total weighted score for each project based on all evaluations.

### 4.5. AI-Powered Features (Genkit Flows)
-   **`generate-detailed-project-idea`:**
    -   **Trigger:** Student enters a theme (e.g., "FinTech App") in the submission form.
    -   **Process:** The AI generates a complete project proposal including a professional title, description, a detailed 200-400 word abstract, and relevant keywords.
    -   **Output:** The generated content populates the submission form fields, which the student can then edit.
-   **`ai-code-review-for-submissions`:**
    -   **Trigger:** Student or Faculty clicks a "Get AI Code Review" button on the project view page.
    -   **Process:** The AI is provided with the project's GitHub URL. It analyzes the repository (conceptually) and provides a text-based review focusing on code quality, potential issues, and recommendations.
    -   **Output:** A plain-text summary of the code review is displayed on the UI.
-   **`generate-pitch-outline`:**
    -   **Trigger:** Student or Faculty clicks "AI Pitch Coach."
    -   **Process:** The flow takes project details (title, description, team members, guide) and uses a `searchGoogleScholar` tool to find relevant academic papers for a "Literature Survey" slide. It then generates a complete 12-slide presentation outline.
    -   **Output:** A structured array of slide objects, each with a title and Markdown content, displayed in an accordion UI.
-   **`find-teammate-matches`:**
    -   **Trigger:** Student visits the "Team Finder" page and clicks "Find My Perfect Teammates."
    -   **Process:** The AI analyzes the current user's skills and work style and compares them against a list of other available students, prioritizing skill complementarity.
    -   **Output:** A sorted list of the top 3-5 compatible teammates, each with a compatibility score and a brief justification.
-   **`triage-support-ticket`:**
    -   **Trigger:** A student submits a support ticket.
    -   **Process:** The AI analyzes the ticket's subject and description to determine its category (e.g., Technical, Team Dispute) and priority (Low, Medium, High).
    -   **Output:** The ticket is saved with the AI-assigned category and priority. An auto-generated initial response is also suggested to the admin.

### 4.6. Admin & Faculty Dashboards
-   **User Management:** Admins can view lists of pending and approved students/faculty and approve/remove them.
-   **Data Export:** Admins/HoDs can export CSV files of student lists, team lists, and project scores, filterable by department.
-   **Guide Assignment:** HoDs have a dedicated dashboard to assign faculty guides to student teams within their department. Includes an "Auto-Assign" feature.
-   **Announcements:** Admins can create and schedule announcements that are broadcast to all users.
-   **Analytics:** A visual dashboard showing statistics on project distribution, evaluation scores by criteria, and overall progress for a selected event.

---

## 5. Technical Specifications

### 5.1. Tech Stack
-   **Frontend:** Next.js (App Router) with TypeScript
-   **Styling:** Tailwind CSS with ShadCN UI components
-   **AI Integration:** Genkit with Google Gemini Models
-   **Backend & Database:** Firebase (Firestore for data, Firebase Auth for authentication, Firebase Storage for file uploads)
-   **Deployment:** Firebase App Hosting / Vercel

### 5.2. Data Models (Expanded)

#### `User` (`/colleges/{collegeId}/users/{userId}`)
-   `id`: string (Firebase Auth UID)
-   `name`: string
-   `email`: string
-   `rollNo`: string
-   `department`: string (e.g., "Computer Science & Engineering")
-   `branch`: string (e.g., "CSE")
-   `section`: string
-   `contactNumber`: string
-   `status`: 'pending' | 'approved'
-   `registeredAt`: number (timestamp)
-   `approvalReminderSentAt`: number (timestamp, optional)
-   `skills`: string[] (e.g., ['React', 'Python'])
-   `workStyle`: string[] (e.g., ['Late-night coder'])
-   `bio`: string
-   `github`: string (URL)
-   `linkedin`: string (URL)
-   `notifications`: `Notification[]`

#### `Faculty` (`/colleges/{collegeId}/faculty/{facultyId}`)
-   `id`: string (Firebase Auth UID)
-   `name`: string
-   `email`: string
-   `role`: 'guide' | 'hod' | 'rnd' | 'external' | 'admin' | 'class-mentor'
-   `department`: string
-   `designation`: string
-   `status`: 'pending' | 'approved'
-   `notifications`: `Notification[]`

#### `Team` (`/colleges/{collegeId}/teams/{teamId}`)
-   `id`: string
-   `name`: string
-   `creatorId`: string (UID of the student who created it)
-   `hackathonId`: string (ID of the event, e.g., 'mini-project')
-   `joinCode`: string
-   `members`: `TeamMember[]` (A subset of User fields + a `role` field)
-   `submissionId`: string (optional, links to a `ProjectSubmission`)
-   `guide`: object (optional, `{id: string, name: string}`)
-   `joinRequests`: `JoinRequest[]`

#### `ProjectSubmission` (`/colleges/{collegeId}/projects/{projectId}`)
-   `id`: string
-   `teamId`: string
-   `hackathonId`: string
-   `projectIdeas`: `ProjectIdea[]`
-   `status`: 'PendingGuide' | 'PendingR&D' | 'PendingHoD' | 'Approved' | 'Rejected'
-   `statusHistory`: `ProjectStatusUpdate[]`
-   `scores`: `Score[]`
-   `totalScore`: number
-   `reviewStage`: 'Pending' | 'Stage1' | 'Stage2' | 'InternalFinal' | 'ExternalFinal' | 'Completed'
-   `submittedAt`: number (timestamp)
-   `imageUrl`: string (optional, AI-generated)

#### `Announcement` (`/colleges/{collegeId}/announcements/{announcementId}`)
-   `id`: string
-   `message`: string
-   `timestamp`: number
-   `publishAt`: number (optional)
-   `expiresAt`: number (optional)

---

## 6. Workflows

### 6.1. Project Approval Workflow
` ``
[Start] -> Student Submits Project
   |
   v
[Pending Guide Approval] -> Guide Reviews
   |
   +-- [Approve] -> [Pending R&D Approval] -> R&D Coordinator Reviews
   |   |
   |   +-- [Approve] -> [Pending HoD Approval] -> HoD Reviews
   |   |   |
   |   |   +-- [Approve] -> [Project Approved] -> [End]
   |   |   |
   |   |   +-- [Reject w/ Remarks] -> [Project Rejected] -> Notify Students -> [Allow Resubmission]
   |   |
   |   +-- [Reject w/ Remarks] -> [Project Rejected] -> Notify Students -> [Allow Resubmission]
   |
   +-- [Reject w/ Remarks] -> [Project Rejected] -> Notify Students -> [Allow Resubmission]
` ``

### 6.2. Support Ticket Workflow
` ``
[Start] -> Student Submits Ticket (Subject, Description)
   |
   v
[AI Triage] -> `triageSupportTicket` Flow
   |   - Assigns Category (e.g., Technical, Team Dispute)
   |   - Assigns Priority (e.g., High, Medium, Low)
   |   - Generates Suggested First Response
   v
[Admin/Faculty Dashboard] -> Admin views triaged ticket
   |
   +-- [Use AI Helper] -> `generateSupportResponse` Flow -> Drafts detailed resolution
   |
   v
[Admin Sends Response] -> Student is Notified
   |
   v
[Admin updates status] -> 'In Progress' or 'Resolved' -> [End]
` ``
