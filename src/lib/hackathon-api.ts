
import { auth, db } from './firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    addDoc, 
    collection, 
    updateDoc, 
    getDoc, 
    query, 
    where, 
    getDocs,
    deleteDoc
} from 'firebase/firestore';
import { User, Judge, Team, Project, Score, UserProfileData, Announcement, Hackathon } from './types';

// --- Auth ---

export async function registerStudent(collegeId: string, { name, email, password }: any) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = {
        id: userCredential.user.uid,
        name,
        email,
        status: 'pending',
        skills: [],
        bio: '',
        github: '',
        linkedin: '',
    };
    await setDoc(doc(db, `colleges/${collegeId}/users`, user.id), user);
    return { successMessage: 'Registration successful! Your account is pending admin approval.' };
}

export async function loginStudent(collegeId: string, { email, password }: any) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, userCredential.user.uid));
    if (!userDoc.exists()) {
        await firebaseSignOut(auth); // Sign out if record not found for this college
        throw new Error("Student record not found for this college.");
    }
    const user = userDoc.data() as User;
    if (user.status === 'pending') {
        await firebaseSignOut(auth);
        throw new Error("Your account is pending approval by an admin.");
    }
    return { successMessage: 'Login successful!' };
}

export async function loginJudge(collegeId: string, { email, password }: any) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const judgeDoc = await getDoc(doc(db, `colleges/${collegeId}/judges`, userCredential.user.uid));
    if (!judgeDoc.exists()) {
        await firebaseSignOut(auth); // Sign out if record not found
        throw new Error("Judge record not found for this college.");
    }
    return { successMessage: 'Login successful!' };
}

export async function loginAdmin({ email, password }: any) {
    // This is a simplified, non-Firebase auth for a single-admin scenario.
    if (email !== 'hacksprint@admin.com' || password !== 'hack123') {
        throw new Error('Invalid admin credentials.');
    }
    return { successMessage: 'Admin login successful!', isAdmin: true };
}


export async function signOut() {
    await firebaseSignOut(auth);
    return { successMessage: 'You have been logged out.' };
}

// --- Admin & Judge ---

export async function addJudge(collegeId: string, { name, email, password }: any) {
    if (!email.toLowerCase().endsWith('@judge.com')) {
        throw new Error('Judge email must end with @judge.com');
    }
    
    // This is a simplified method. A real app should use a backend function to create users to avoid auth state conflicts.
    // For this demo, we assume the admin's auth state is not persisted or they will re-login.
    const tempAuth = auth;
    
    try {
        const currentUser = tempAuth.currentUser;
        
        const judgeCredential = await createUserWithEmailAndPassword(auth, email, password);
        const judge: Judge = { 
            id: judgeCredential.user.uid,
            name, 
            email,
        };
        await setDoc(doc(db, `colleges/${collegeId}/judges`, judge.id), judge);
        
        // Sign out the newly created user and restore original admin/judge session if it existed
        await firebaseSignOut(auth);
        if (currentUser) {
            // This is a simplified re-auth. A robust solution would use refresh tokens.
            // For the demo, we assume the admin/judge might need to log in again if their session is lost.
        }

        return { successMessage: 'Judge added successfully! They can log in with the provided credentials.' };
    } catch (error: any) {
        await firebaseSignOut(auth).catch(() => {}); // Attempt to sign out any lingering temporary user
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email is already in use. Please use a different email.');
        }
        console.error("Error creating judge:", error);
        throw new Error('Failed to create judge account.');
    }
}


export async function removeJudge(collegeId: string, judgeId: string) {
    await deleteDoc(doc(db, `colleges/${collegeId}/judges`, judgeId));
    // Note: This does not delete the Firebase Auth user. A secure implementation
    // would use a Cloud Function to handle this deletion.
    return { successMessage: "Judge removed successfully." };
}

export async function approveStudent(collegeId: string, userId: string) {
    await updateDoc(doc(db, `colleges/${collegeId}/users`, userId), { status: 'approved' });
    return { successMessage: "Student approved successfully." };
}

export async function registerAndApproveStudent(collegeId: string, { name, email, password }: any) {
     try {
        const tempAuth = auth;
        const currentUser = tempAuth.currentUser;

        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
        const newUser: User = {
            id: userCredential.user.uid,
            name,
            email,
            status: 'approved',
            skills: [], bio: '', github: '', linkedin: ''
        };
        await setDoc(doc(db, `colleges/${collegeId}/users`, newUser.id), newUser);
        
        await firebaseSignOut(tempAuth);
        if (currentUser) {
            // As before, a more robust session management would be needed in a production app.
        }

        return { successMessage: `${name} has been registered and approved.` };
    } catch(error: any) {
        await firebaseSignOut(auth).catch(() => {});
         if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email is already in use. Please use a different email.');
        }
        throw new Error('Failed to create student account.');
    }
}


export async function removeStudent(collegeId: string, userId: string) {
    const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, userId));
    if (!userDoc.exists()) return { successMessage: "Student already removed." };
    
    const user = userDoc.data() as User;

    if (user.teamId && user.hackathonId) {
        const teamDoc = await getDoc(doc(db, `colleges/${collegeId}/hackathons/${user.hackathonId}/teams`, user.teamId));
        if (teamDoc.exists()) {
            const team = teamDoc.data() as Team;
            const updatedMembers = team.members.filter((m: any) => m.id !== userId);
            if (updatedMembers.length > 0) {
                await updateDoc(teamDoc.ref, { members: updatedMembers });
            } else {
                // If the team is empty after removing the member, delete the team
                await deleteDoc(teamDoc.ref);
            }
        }
    }
    
    await deleteDoc(doc(db, `colleges/${collegeId}/users`, userId));

    return { successMessage: `Student ${user.name} has been removed.` };
}

export async function createHackathon(collegeId: string, hackathonData: Omit<Hackathon, 'id'>) {
    const newHackathonRef = await addDoc(collection(db, `colleges/${collegeId}/hackathons`), hackathonData);
    return { successMessage: `Hackathon "${hackathonData.name}" created successfully.`, id: newHackathonRef.id };
}

export async function updateHackathon(collegeId: string, hackathonId: string, hackathonData: Partial<Omit<Hackathon, 'id'>>) {
    await updateDoc(doc(db, `colleges/${collegeId}/hackathons`, hackathonId), hackathonData);
    return { successMessage: `Hackathon "${hackathonData.name}" updated successfully.` };
}


export async function postAnnouncement(collegeId: string, message: string) {
    const newAnnouncement: Omit<Announcement, 'id'> = {
        message,
        timestamp: Date.now(),
    };
    await addDoc(collection(db, `colleges/${collegeId}/announcements`), newAnnouncement);
    return { successMessage: 'Announcement posted successfully.' };
}

// --- Student ---

export async function selectHackathonForStudent(collegeId: string, userId: string, hackathonId: string | null) {
    await updateDoc(doc(db, `colleges/${collegeId}/users`, userId), { hackathonId: hackathonId, teamId: null }); // Also reset teamId when changing hackathons
    if (hackathonId) {
        return { successMessage: "Hackathon selected successfully!" };
    }
    return {};
}

export async function createTeam(collegeId: string, hackathonId: string, teamName: string, user: User) {
    const newTeam: Omit<Team, 'id'> = {
        name: teamName,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [user],
        hackathonId,
        projectId: ""
    };
    const teamRef = await addDoc(collection(db, `colleges/${collegeId}/hackathons/${hackathonId}/teams`), newTeam);
    await updateDoc(doc(db, `colleges/${collegeId}/users`, user.id), { teamId: teamRef.id });
    return { successMessage: "Team created successfully!" };
}

export async function joinTeam(collegeId: string, hackathonId: string, joinCode: string, user: User) {
    const q = query(collection(db, `colleges/${collegeId}/hackathons/${hackathonId}/teams`), where("joinCode", "==", joinCode));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        throw new Error("Invalid join code for this hackathon.");
    }
    const teamDoc = querySnapshot.docs[0];
    const team = teamDoc.data() as Team;

    if ((team.members as User[]).some(m => m.id === user.id)) {
        throw new Error("You are already in this team.");
    }

    const updatedMembers = [...team.members, user];
    await updateDoc(teamDoc.ref, { members: updatedMembers });
    await updateDoc(doc(db, `colleges/${collegeId}/users`, user.id), { teamId: teamDoc.id });

    return { successMessage: `Successfully joined team: ${team.name}` };
}

export async function submitProject(collegeId: string, hackathonId: string, { name, description, githubUrl, teamId }: any) {
    const newProject: Omit<Project, 'id'> = {
        teamId,
        hackathonId,
        name,
        description,
        githubUrl,
        scores: [],
        averageScore: 0,
    };
    const projectRef = await addDoc(collection(db, `colleges/${collegeId}/hackathons/${hackathonId}/projects`), newProject);
    await updateDoc(doc(db, `colleges/${collegeId}/hackathons/${hackathonId}/teams`, teamId), { projectId: projectRef.id });
    return { successMessage: "Project submitted successfully!" };
}

export async function updateProfile(collegeId: string, userId: string, profileData: Partial<UserProfileData>) {
    await updateDoc(doc(db, `colleges/${collegeId}/users`, userId), profileData);
    return { successMessage: "Profile updated successfully." };
}

// --- Judge ---
export async function scoreProject(collegeId: string, hackathonId: string, projectId: string, judgeId: string, scores: Score[]) {
    const projectRef = doc(db, `colleges/${collegeId}/hackathons/${hackathonId}/projects`, projectId);
    const projectDoc = await getDoc(projectRef);
    const project = projectDoc.data() as Project;

    const otherScores = project.scores.filter(s => s.judgeId !== judgeId);
    const newScores = [...otherScores, ...scores];

    const JUDGING_RUBRIC = [
        { id: 'innovation', name: 'Innovation & Originality', max: 10 },
        { id: 'technical_complexity', name: 'Technical Complexity', max: 10 },
        { id: 'ui_ux', name: 'UI/UX Design', max: 10 },
        { id: 'presentation', name: 'Presentation & Pitch', max: 10 },
    ];
    
    const uniqueJudges = new Set(newScores.map(s => s.judgeId));
    const totalPossibleScore = uniqueJudges.size * JUDGING_RUBRIC.reduce((sum, c) => sum + c.max, 0);
    const totalScore = newScores.reduce((sum, score) => sum + score.value, 0);
    const averageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 10 : 0;

    await updateDoc(projectRef, { scores: newScores, averageScore });
    return { successMessage: "Scores submitted successfully." };
}

