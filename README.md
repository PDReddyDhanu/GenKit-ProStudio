# HackSprint: All-in-One Hackathon Management Platform

HackSprint is a comprehensive, AI-powered SaaS platform built with Next.js and Firebase to streamline the organization and management of internal college hackathons. It provides a seamless experience for students, judges, and administrators, from registration and team formation to final project judging and results announcement.

![HackSprint Homepage](https://i.imgur.com/your-screenshot.png) <!-- Replace with a real screenshot URL -->

## ✨ Key Features

- **Role-Based Portals:** Separate, dedicated interfaces for Students, Judges, and Administrators.
- **Team Management:** Students can easily create new teams or join existing ones with a unique code.
- **AI-Powered Assistance:**
    - **Idea Generation:** Stuck for an idea? The AI suggests creative project ideas based on user interests.
    - **Code Review:** Get instant, AI-powered feedback on submitted GitHub repositories.
    - **Project Summaries:** AI generates concise summaries of projects to assist judges in their evaluation.
    - **Guidance Hub:** An AI chatbot to answer questions about hackathons, career paths, and more.
- **Real-time Leaderboard:** A live, dynamic leaderboard visualizes team scores and rankings as they come in.
- **Project Showcase:** A gallery to display all submitted projects, celebrating the participants' work.
- **Fair & Easy Judging:** A dedicated portal for judges to view submissions, score projects against a defined rubric, and view AI-generated summaries.
- **Admin Dashboard:** Centralized control for admins to manage users, approve registrations, add judges, and post announcements.
- **Automated Certificate Generation:** Winners can download a verifiable PDF certificate of achievement.

---

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/) for componentry.
- **AI Integration:** [Google AI (Gemini) via Genkit](https://firebase.google.com/docs/genkit)
- **Database & Auth (Simulated):** State management using React Context and `localStorage` to simulate a Firebase backend.
- **Deployment:** Ready for [Vercel](https://vercel.com/) or [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

---

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/PDR-Dhanu/hacksprint_.git
    cd hacksprint
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google Gemini API key. You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running at [http://localhost:9002](http://localhost:9002).

---

## 📂 Project Structure

The project follows a standard Next.js App Router structure:

```
/
├── public/               # Static assets
├── src/
│   ├── app/              # Main application routes and pages
│   │   ├── (portals)/    # Route groups for admin, judge, student, etc.
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Homepage
│   ├── ai/               # Genkit AI flows and configuration
│   │   ├── flows/
│   │   └── genkit.ts
│   ├── components/       # Shared UI components (layout, ShadCN UI)
│   ├── context/          # React Context for state management
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Helper functions, constants, types
└── ...                   # Config files (tailwind, next, etc.)
```

---

## 🤖 AI Integration with Genkit

This project leverages **Genkit**, a framework for building AI-powered features, to connect to the Gemini API.

- **Location:** All AI-related logic is located in `src/ai/`.
- **Configuration:** The central Genkit configuration is in `src/ai/genkit.ts`, which initializes the Google AI plugin with the API key from the `.env` file.
- **Flows:** Individual AI features (like idea generation or code review) are defined as "flows" in `src/ai/flows/`. Each flow encapsulates a prompt and the logic for interacting with the Gemini model.
- **Server Actions:** The frontend communicates with these flows via Next.js Server Actions defined in `src/app/actions.ts`.

---

## 🚀 Deployment

This application is optimized for deployment on Vercel or Firebase App Hosting.

### Deploying with Vercel

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the repository into your Vercel dashboard.
3.  Vercel will automatically detect the Next.js framework.
4.  **Important:** Add your `NEXT_PUBLIC_GEMINI_API_KEY` as an environment variable in the Vercel project settings.
5.  Click "Deploy". Vercel will build and deploy your application.

---

## 👨‍💻 Author

This project was developed by **Dhanunjay Reddy Palakolanu**.

- **GitHub:** [@PDR-Dhanu](https://github.com/PDR-Dhanu)
- **LinkedIn:** [dhanunjay-reddy-palakolanu-pdr](https://www.linkedin.com/in/dhanunjay-reddy-palakolanu-pdr/)
- **X (Twitter):** [@PDReddyDhanu](https://x.com/PDReddyDhanu)
- **YouTube:** [@pdreddy](https://www.youtube.com/@pdreddy)
