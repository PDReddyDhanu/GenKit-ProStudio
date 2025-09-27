# Product Requirements Document: HackSprint

**Version:** 1.0
**Date:** 2024-08-01
**Author:** AI Assistant (Gemini)

---

## 1. Introduction

### 1.1. Project Vision
To create a seamless, all-in-one SaaS platform that empowers colleges to effortlessly organize, manage, and execute internal hackathons. By leveraging AI-powered assistance and providing dedicated portals for every user role, HackSprint aims to foster innovation, streamline administration, and enhance the overall hackathon experience for students, judges, and organizers.

### 1.2. Purpose of this Document
This document outlines the product requirements for the HackSprint platform. It defines the target users, their needs, the features of the platform, and the technical specifications required to build it. It serves as the single source of truth for all stakeholders involved in the project.

### 1.3. Target Audience
The platform is designed for three primary user roles:
-   **Students:** Participants of the hackathon.
-   **Judges:** Industry experts or faculty responsible for evaluating projects.
-   **Administrators:** Faculty or event organizers responsible for managing the entire hackathon.

---

## 2. Goals and Objectives

### 2.1. Business Goals
-   **Streamline Hackathon Management:** Significantly reduce the administrative overhead of organizing a college hackathon.
-   **Enhance Participant Engagement:** Provide a rich, interactive, and helpful experience for students.
-   **Foster Innovation:** Equip students with AI tools that help them brainstorm, build, and improve their projects.
-   **Ensure Fair & Transparent Judging:** Create a structured and efficient evaluation process for judges.

### 2.2. Success Metrics
-   Time saved by administrators in managing registrations, submissions, and reporting.
-   High adoption and satisfaction rates among students and judges.
-   Number of projects successfully submitted through the platform.
-   Usage frequency of AI-powered assistance features (Idea Generation, Code Review, etc.).

---

## 3. User Roles & Features

### 3.1. User Personas

#### 3.1.1. Student (e.g., "Priya")
-   **Needs:** To easily register for the hackathon, find a team with complementary skills, get help with project ideas, submit her project without hassle, track her team's progress, and see the final results.
-   **Pain Points:** Difficulty finding teammates, uncertainty about project ideas, complex submission processes, lack of feedback on her work.

#### 3.1.2. Judge (e.g., "Mr. Sharma")
-   **Needs:** A centralized place to view all project submissions, clear and consistent scoring rubrics, quick ways to understand the core of each project, and tools to manage their evaluation workload.
-   **Pain Points:** Disorganized submissions (spreadsheets, emails), subjective scoring, time-consuming evaluation process.

#### 3.1.3. Administrator (e.g., "Dr. Davis")
-   **Needs:** A dashboard to manage the entire event, approve users, add judges, broadcast announcements, monitor analytics, and generate final reports.
-   **Pain Points:** Manual user registration, chaotic communication channels, difficulty tracking submissions and scores, tedious report creation after the event.

### 3.2. Feature Matrix

| Feature                         | Student | Judge | Admin | Description                                                                                |
| ------------------------------- | :-----: | :---: | :---: | ------------------------------------------------------------------------------------------ |
| **User Authentication**         |    ✅    |  ✅   |  ✅   | Secure login/signup, email verification, and role-based access.                            |
| **College Selection**           |    ✅    |  ✅   |  ✅   | Users select their college to enter the specific hackathon portal.                         |
| **Dashboard**                   |    ✅    |  ✅   |  ✅   | Role-specific landing pages with relevant information and actions.                         |
| **Team Management**             |    ✅    |   -   |  ✅   | Create teams, join with a code, manage members, and view team details.                     |
| **Project Submission**          |    ✅    |   -   |  ✅   | Submit project name, description, and GitHub URL.                                          |
| **Project Showcase**            |    ✅    |  ✅   |  ✅   | A public gallery of all submitted projects for a selected hackathon.                       |
| **Live Leaderboard**            |    ✅    |  ✅   |  ✅   | Real-time ranking of teams based on judges' scores.                                        |
| **Judging Portal**              |    -    |  ✅   |  ✅   | Interface for judges to view submissions and score them against a defined rubric.          |
| **Admin Management**            |    -    |   -   |  ✅   | Manage users (approve/remove), add/remove judges, and oversee event data.                |
| **Announcements**               |    ✅    |  ✅   |  ✅   | Admins can post announcements, which appear in a real-time feed for all users.             |
| **Certificate Generation**      |    ✅    |   -   |  ✅   | Winners can download a verifiable PDF Certificate of Achievement.                          |
| **AI Idea Generation**          |    ✅    |   -   |   -   | AI suggests project themes and ideas based on user interests.                              |
| **AI Code Review**              |    ✅    |  ✅   |   -   | Get instant, AI-powered feedback on code quality from a GitHub repository.                 |
| **AI Project Summary**          |    -    |  ✅   |   -   | Judges can generate concise summaries of projects to speed up evaluation.                  |
| **AI Guidance Hub**             |    ✅    |  ✅   |  ✅   | An AI chatbot to answer questions about hackathons, careers, and more.                     |
| **AI Team Finder**              |    ✅    |   -   |   -   | AI suggests compatible teammates based on skills and work styles.                          |
| **AI Report Generation**        |    -    |  ✅   |  ✅   | Admins can generate a full hackathon summary report with statistics and winner announcements.|
| **AI Support Triage**           |    ✅    |   -   |  ✅   | AI automatically categorizes and prioritizes student support tickets for admins.           |
| **AI Pitch Coach**              |    ✅    |   -   |   -   | AI generates a 5-slide presentation outline for a student's project.                     |
| **AI Project Image Generation** |    ✅    |   -   |  ✅   | AI generates an abstract hero image for each project submission.                           |

---

## 4. Technical Specifications

### 4.1. Tech Stack
-   **Framework:** Next.js (with App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS with ShadCN UI components
-   **Generative AI:** Google AI (Gemini) via Genkit
-   **Database & Auth (Simulated):** React Context and `localStorage` are used to simulate a Firebase backend. In a real-world scenario, this would be replaced with Firebase (Firestore, Firebase Auth).

### 4.2. Data Models (Simplified)

#### `College`
-   `id`: string (e.g., "Vidya Jyothi Institute of Technology")
-   Contains sub-collections for `users`, `judges`, `teams`, `projects`, etc.

#### `User`
-   `id`: string (UID)
-   `name`: string
-   `email`: string
-   `status`: 'pending' | 'approved'
-   `skills`: string[]
-   `workStyle`: string[]
-   `bio`: string
-   `github`: string
-   `notifications`: Notification[]

#### `Team`
-   `id`: string
-   `name`: string
-   `creatorId`: string (User ID)
-   `joinCode`: string
-   `members`: Member[]
-   `joinRequests`: Request[]
-   `hackathonId`: string
-   `messages`: ChatMessage[]

#### `Project`
-   `id`: string
-   `teamId`: string
-   `hackathonId`: string
-   `name`: string
-   `description`: string
-   `githubUrl`: string
-   `imageUrl`: string (AI-generated)
-   `scores`: Score[]
-   `averageScore`: number

#### `Judge`
-   `id`: string (UID)
-   `name`: string
-   `email`: string
-   `bio`: string
-   `notifications`: Notification[]

#### `Hackathon`
-   `id`: string
-   `name`: string
-   `prizeMoney`: string
-   `rules`: string
-   `deadline`: number (timestamp)

#### `SupportTicket`
-   `id`: string
-   `studentId`: string
-   `subject`: string
-   `question`: string
-   `status`: 'New' | 'In Progress' | 'Resolved'
-   `category`: string (AI-triaged)
-   `priority`: 'Low' | 'Medium' | 'High' (AI-triaged)
-   `responses`: Response[]

### 4.3. AI Integration (Genkit Flows)
The platform uses Genkit, a framework for building AI features, to connect to the Google Gemini models. All AI logic is encapsulated in "flows" located in `src/ai/flows/`.

-   **`ai-project-idea-suggestions`**: Generates hackathon themes.
-   **`generate-project-idea`**: Generates a specific project idea from a theme.
-   **`ai-code-review-for-submissions`**: Analyzes a GitHub repo and provides feedback.
-   **`project-summary-for-judges`**: Summarizes a project for judges.
-   **`fetch-guidance-info`**: Powers the AI Guidance Hub chatbot.
-   **`generate-project-image`**: Creates an abstract image for a project.
-   **`generate-pitch-outline`**: Creates a 5-slide presentation structure.
-   **`find-teammate-matches`**: Matches students based on skills and work style.
-   **`generate-hackathon-summary-report`**: Creates a full Markdown report of the event.
-   **`triage-support-ticket`**: Categorizes and prioritizes incoming support requests.
-   **`generate-support-response`**: Drafts a detailed response to a support ticket.

---

## 5. Out of Scope

The following features are explicitly out of scope for this version of the project:
-   Direct integration with third-party project management tools (e.g., Jira, Trello).
-   Real-time video or voice chat for team collaboration.
-   Payment processing for registration fees or sponsorships.
-   Public, inter-college hackathons (the focus is on internal events).
-   A native mobile application (the web app is designed to be mobile-responsive).
