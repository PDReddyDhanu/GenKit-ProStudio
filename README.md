
# GenKit ProStudio: College Project Management Hub

GenKit ProStudio is a comprehensive, AI-powered SaaS platform built with Next.js and Firebase to streamline the lifecycle of academic projects in colleges. It provides a seamless, transparent, and efficient experience for students, faculty guides, HoDs, and administrators, from project proposal and team formation to final evaluation and reporting.

![GenKit ProStudio Homepage](https://i.imgur.com/your-screenshot.png) <!-- Replace with a real screenshot URL -->

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
