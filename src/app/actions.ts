"use server";

import { generateProjectIdea as generateProjectIdeaFlow, GenerateProjectIdeaInput } from '@/ai/flows/generate-project-idea';
import { suggestThemes as suggestThemesFlow, SuggestThemesInput } from '@/ai/flows/ai-project-idea-suggestions';
import { aiCodeReviewForSubmissions as aiCodeReviewFlow, AiCodeReviewForSubmissionsInput } from '@/ai/flows/ai-code-review-for-submissions';
import { generateProjectSummary as generateProjectSummaryFlow, ProjectSummaryInput } from '@/ai/flows/project-summary-for-judges';
import { fetchGuidanceInfo as fetchGuidanceInfoFlow, FetchGuidanceInfoInput } from '@/ai/flows/fetch-guidance-info';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, where, documentId, writeBatch, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { User, Team, Project, Judge, Score, UserProfileData, HackathonData } from '@/lib/types';

// AI Related Actions
export async function generateProjectIdea(input: GenerateProjectIdeaInput): Promise<string> {
    try {
        const result = await generateProjectIdeaFlow(input);
        return result.idea;
    } catch (error) {
        console.error("Error generating project idea:", error);
        return "Failed to generate an idea. Please try again.";
    }
}

export async function suggestThemes(query: SuggestThemesInput): Promise<string[]> {
    try {
        const result = await suggestThemesFlow(query);
        return result.themes;
    } catch (error) {
        console.error("Error suggesting themes:", error);
        return [];
    }
}

export async function getAiCodeReview(input: AiCodeReviewForSubmissionsInput): Promise<string> {
    try {
        const result = await aiCodeReviewFlow(input);
        return result.review;
    } catch (error) {
        console.error("Error getting AI code review:", error);
        return "Failed to get AI code review. Please try again.";
    }
}

export async function getAiProjectSummary(input: ProjectSummaryInput): Promise<string> {
    try {
        const result = await generateProjectSummaryFlow(input);
        return result.summary;
    } catch (error) {
        console.error("Error getting AI project summary:", error);
        return "Failed to get AI project summary. Please try again.";
    }
}

export async function getGuidance(input: FetchGuidanceInfoInput): Promise<string> {
    try {
        const result = await fetchGuidanceInfoFlow(input);
        return result.response;
    } catch (error) {
        console.error("Error fetching guidance:", error);
        return "Sorry, I couldn't fetch guidance at this time. Please try again later.";
    }
}


// Firebase Data Actions
export async function getHackathonData(): Promise<HackathonData> {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

    const projectsSnapshot = await getDocs(collection(db, "projects"));
    const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    const judgesSnapshot = await getDocs(collection(db, "judges"));
    const judges = judgesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Judge));

    return { users, teams, projects, judges };
  } catch (error) {
    console.error("Error fetching hackathon data:", error);
    return { users: [], teams: [], projects: [], judges: [] };
  }
}

export async function registerStudent(payload: { name: string; email: string; password: string }): Promise<{ success: boolean; message: string; }> {
  try {
    const q = query(collection(db, "users"), where("email", "==", payload.email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return { success: false, message: "A user with this email already exists." };
    }
    await addDoc(collection(db, "users"), {
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: payload.password, // In a real app, hash this!
        status: 'pending',
        skills: [],
        bio: '',
        github: '',
        linkedin: ''
    });
    return { success: true, message: "Registration successful! Your account is pending admin approval." };
  } catch (error) {
    console.error("Error registering student:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}


export async function createTeam(payload: { teamName: string, userId: string }): Promise<{ success: boolean; message: string; }> {
    try {
        const userRef = doc(db, "users", payload.userId);
        const newTeamRef = doc(collection(db, "teams"));
        
        const newTeam: Omit<Team, 'id'> = {
            name: payload.teamName,
            joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            members: [payload.userId], // Store user IDs
            projectId: ""
        };

        const batch = writeBatch(db);
        batch.set(newTeamRef, newTeam);
        batch.update(userRef, { teamId: newTeamRef.id });
        await batch.commit();

        return { success: true, message: "Team created successfully!" };
    } catch (error) {
        console.error("Error creating team: ", error);
        return { success: false, message: "Failed to create team." };
    }
}

export async function joinTeam(payload: { joinCode: string, userId: string }): Promise<{ success: boolean; message: string; }> {
    try {
        const q = query(collection(db, "teams"), where("joinCode", "==", payload.joinCode));
        const teamSnapshot = await getDocs(q);

        if (teamSnapshot.empty) {
            return { success: false, message: "Invalid join code." };
        }

        const teamDoc = teamSnapshot.docs[0];
        const teamData = teamDoc.data() as Team;

        if (teamData.members.includes(payload.userId)) {
             return { success: false, message: "You are already in this team." };
        }
        
        const batch = writeBatch(db);
        batch.update(teamDoc.ref, { members: [...teamData.members, payload.userId] });
        batch.update(doc(db, "users", payload.userId), { teamId: teamDoc.id });
        await batch.commit();

        return { success: true, message: `Successfully joined team: ${teamData.name}`};
    } catch (error) {
        console.error("Error joining team:", error);
        return { success: false, message: "Failed to join team." };
    }
}


export async function submitProject(payload: { name: string; description: string; githubUrl: string, teamId: string }): Promise<{ success: boolean; message: string; }> {
    try {
        const teamRef = doc(db, "teams", payload.teamId);
        const newProjectRef = doc(collection(db, "projects"));

        const newProject: Omit<Project, 'id'> = {
            teamId: payload.teamId,
            name: payload.name,
            description: payload.description,
            githubUrl: payload.githubUrl,
            scores: [],
            averageScore: 0,
        };
        
        const batch = writeBatch(db);
        batch.set(newProjectRef, newProject);
        batch.update(teamRef, { projectId: newProjectRef.id });
        await batch.commit();

        return { success: true, message: "Project submitted successfully!" };
    } catch (error) {
        console.error("Error submitting project:", error);
        return { success: false, message: "Failed to submit project." };
    }
}

export async function addJudge(payload: { name: string; email: string; password: string }): Promise<{ success: boolean; message: string; }> {
    try {
        if (!payload.email.toLowerCase().endsWith('@judge.com')) {
            return { success: false, message: 'Judge email must end with @judge.com' };
        }
        const q = query(collection(db, "judges"), where("email", "==", payload.email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { success: false, message: 'A judge with this email already exists.' };
        }

        await addDoc(collection(db, "judges"), {
            name: payload.name,
            email: payload.email.toLowerCase(),
            password: payload.password // In a real app, hash this!
        });

        return { success: true, message: "Judge added successfully!" };
    } catch (error) {
        console.error("Error adding judge:", error);
        return { success: false, message: "Failed to add judge." };
    }
}

export async function approveStudent(payload: { userId: string }): Promise<{ success: boolean; message: string; }> {
    try {
        const userRef = doc(db, "users", payload.userId);
        await updateDoc(userRef, { status: "approved" });
        return { success: true, message: "Student approved." };
    } catch (error) {
        console.error("Error approving student:", error);
        return { success: false, message: "Failed to approve student." };
    }
}

export async function scoreProject(payload: { projectId: string; judgeId: string; scores: Score[] }): Promise<{ success: boolean; message: string; }> {
    try {
        const projectRef = doc(db, "projects", payload.projectId);
        const projectDoc = await getDoc(projectRef);
        if (!projectDoc.exists()) {
            return { success: false, message: "Project not found." };
        }

        const projectData = projectDoc.data() as Project;
        const otherScores = projectData.scores.filter(s => s.judgeId !== payload.judgeId);
        const newScores = [...otherScores, ...payload.scores];

        await updateDoc(projectRef, { scores: newScores });
        
        return { success: true, message: "Scores submitted successfully." };
    } catch (error) {
        console.error("Error scoring project:", error);
        return { success: false, message: "Failed to submit scores." };
    }
}

export async function updateUserProfile(payload: { userId: string, profileData: Partial<UserProfileData> }): Promise<{ success: boolean; message: string; }> {
    try {
        const userRef = doc(db, "users", payload.userId);
        await updateDoc(userRef, payload.profileData);
        return { success: true, message: "Profile updated successfully." };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, message: "Failed to update profile." };
    }
}


export async function postAnnouncement(message: string): Promise<{ success: boolean; error?: string }> {
  try {
    await addDoc(collection(db, "announcements"), {
      message: message,
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error posting announcement:", error);
    return { success: false, error: "Failed to post announcement." };
  }
}

export async function getAnnouncements() {
  try {
    const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const announcements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}
