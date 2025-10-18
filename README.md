

# GenKit ProStudio: College Project Management Hub

GenKit ProStudio is a comprehensive, AI-powered SaaS platform built with Next.js and Firebase to streamline the lifecycle of academic projects in colleges. It provides a seamless, transparent, and efficient experience for students, faculty guides, HoDs, and administrators, from project proposal and team formation to final evaluation and reporting.

![GenKit ProStudio Homepage](https://i.imgur.com/your-screenshot.png) <!-- Replace with a real screenshot URL ---> 

---

## LaTeX Resume Entry

Here is a professionally crafted LaTeX entry for this project, ready to be included in your resume.

```latex
% ===== PROJECT EXPERIENCE =====
\section{Project Experience}
\project{GenKit ProStudio – AI-Enhanced Academic Project Management Platform}{Aug 2024}{}
\vspace{-24pt}
\begin{itemize}
    \item Architected and developed a full-stack, enterprise-grade SaaS platform using \textbf{Next.js} and \textbf{Firebase} to digitize and manage the entire academic project lifecycle for colleges.
    \item Implemented a multi-level approval workflow and role-based access control for Students, Guides, HoDs, and Admins, ensuring transparent and efficient project tracking.
    \item Integrated \textbf{Google Gemini AI via Genkit} to power intelligent features, including an AI Idea Generator, a code reviewer, a pitch outline creator, and an AI-driven teammate matchmaking system.
    \item Designed and built responsive, data-driven dashboards with \textbf{Tailwind CSS} and \textbf{ShadCN UI} for user management, project evaluation, analytics, and automated reporting.
    \item Engineered a secure backend with \textbf{Firebase (Firestore, Auth, Storage)}, handling user authentication, data persistence, and file uploads.
    \item \textbf{Tech Stack:} Next.js, React, TypeScript, Genkit (Google Gemini), Firebase, Tailwind CSS
    \item \textbf{Live:} \href{https://prostudio-pdr.kesug.com}{prostudio-pdr.kesug.com} ~~~ \textbf{GitHub:} \href{https://github.com/PDReddyDhanu/GenKit-ProStudio}{Repo}
\end{itemize}

\vspace{4pt}
\project{HackSprint – AI-Powered Hackathon Management Platform}{May 2025}{}
\vspace{-24pt}
\begin{itemize}
    \item Developed a full-stack, serverless platform using \textbf{Next.js (App Router)} for managing internal college hackathons.
    \item Integrated \textbf{Google Gemini AI via Genkit} for AI-powered project idea generation, code reviews, and automated judge summaries.
    \item Designed dashboards and portals for students, judges, and admins, including a real-time leaderboard and auto certificate generation using \textbf{jsPDF}.
    \item Created a responsive and consistent interface with \textbf{Tailwind CSS}, enhancing usability across devices.
    \item \textbf{Tech Stack:} Next.js, React, TypeScript, Google Gemini AI API, Tailwind CSS
    \item \textbf{Live:} \href{https://hacksprint-rouge.vercel.app/}{HackSprint} ~~~ \textbf{GitHub:} \href{https://github.com/PDReddyDhanu/hacksprit}{Repo}
\end{itemize}

\vspace{4pt}
\project{Short Music Tunes – Web-Based Song Preview Platform}{Jun 2024}{}
\vspace{-24pt}
\begin{itemize}
    \item Created a responsive and ad-free music preview web app that allows users to search and play short song clips in real-time using the \textbf{iTunes Search API}.
    \item Implemented a clean UI with interactive audio controls and responsive design for a smooth experience across devices.
    \item \textbf{Tech Stack:} HTML, CSS, JavaScript, iTunes API, Netlify
    \item \textbf{Live:} \href{https://pdr-tunes.netlify.app/}{Short Music Tunes} ~~~ \textbf{GitHub:} \href{https://github.com/PDReddyDhanu/Short-Music-Tunes}{Repo}
\end{itemize}
```

---

## ✨ Key Features

- **Role-Based Workflows:** Dedicated portals and dashboards for Students, Guides, R&D Coordinators, HoDs, and Admins. 
- **Multi-Level Approval System:** A transparent and structured workflow for project proposals: Guide → R&D Coordinator → HoD.
- **Comprehensive Team Management:** Students can easily create teams, invite members via code, and assign roles.
- **AI-Powered Assistance:**
    - **Abstract Summarizer:** AI generates concise summaries of project abstracts to help faculty review submissions faster.
    - **Support Triage:** Student-submitted issues are automatically categorized and prioritized by an AI agent.
    - **Draft Generation:** AI helps faculty draft detailed responses to common student queries.
- **Centralized Evaluation:** A dedicated portal for internal and external faculty to evaluate projects against standardized rubrics and score individual contributions.
- **Analytics & Reporting:** Admins and HoDs can view departmental analytics, track project progress, and download reports on students, teams, and scores.
- **Integrated Communication:** A discussion tab on each project for seamless communication between students and their assigned faculty guide.

---

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/) for componentry.
- **AI Integration:** [Google AI (Gemini) via Genkit](https://firebase.google.com/docs/genkit)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Firebase Auth)
- **File Storage:** [Firebase Storage](https://firebase.google.com/docs/storage) for document uploads.

---

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/genkit-pro-studio
    cd genkit-pro-studio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google Gemini API key and Firebase configuration.
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    NEXT_PUBLIC_FIREBASE_CONFIG=YOUR_FIREBASE_CONFIG_JSON
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running at [http://localhost:9002](http://localhost:9002).

---

## 📂 Project Structure

```
/
├── public/
├── src/
│   ├── app/              # Main application routes
│   │   ├── (portals)/    # Route groups for admin, faculty, student
│   │   └── page.tsx      # Homepage
│   ├── ai/               # Genkit AI flows and configuration
│   ├── components/       # Shared UI components
│   ├── context/          # React Context for state management
│   ├── lib/              # Firebase config, API functions, types
└── ...                   # Config files
```

---

## 🤖 AI Integration with Genkit

This project leverages **Genkit** to connect to the Gemini API for its AI features.

- **Location:** AI logic resides in `src/ai/`.
- **Configuration:** `src/ai/genkit.ts` initializes the Google AI plugin.
- **Flows:** Features like abstract summarization are defined as "flows" in `src/ai/flows/`.
- **Server Actions:** The frontend communicates with these flows via Next.js Server Actions.

---

## 🚀 Deployment

This application is optimized for deployment on Vercel or Firebase App Hosting.

1.  Push your code to a Git repository.
2.  Import the repository into your Vercel dashboard.
3.  **Important:** Add your `NEXT_PUBLIC_GEMINI_API_KEY` and `NEXT_PUBLIC_FIREBASE_CONFIG` as environment variables in the Vercel project settings.
4.  Click "Deploy".
