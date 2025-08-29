
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
import { User, Judge, Team, Project, Score, UserProfileData, Announcement } from './types';

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
    // This is a simplified, client-side check. 
    // It does not involve Firebase Auth for the admin role.
    if (email !== 'hacksprint@admin.com' || password !== 'hack123') {
        throw new Error('Invalid admin credentials.');
    }
    return { successMessage: 'Admin login successful!', isAdmin: true };
}


export async function signOut() {
    await firebaseSignOut(auth);
    return { successMessage: 'You have been logged out.' };
}

// --- Admin ---

export async function addJudge(collegeId: string, { name, email, password }: any) {
    if (!email.toLowerCase().endsWith('@judge.com')) {
        throw new Error('Judge email must end with @judge.com');
    }
    
    // NOTE: This is a client-side workaround. A secure production app would use a Cloud Function.
    // This flow creates a user but since we don't store the admin's auth credentials,
    // we can't sign them back in. The local state management will keep them logged in UI-wise.
    try {
        const judgeCredential = await createUserWithEmailAndPassword(auth, email, password);
        const judge: Judge = { 
            id: judgeCredential.user.uid,
            name, 
            email,
        };
        await setDoc(doc(db, `colleges/${collegeId}/judges`, judge.id), judge);
         // Sign out the newly created judge so the admin session isn't disrupted
        await firebaseSignOut(auth);
        return { successMessage: 'Judge added successfully! They can log in with the provided credentials.' };
    } catch (error: any) {
         // Attempt to sign out to clear any partial auth state
        await firebaseSignOut(auth).catch(() => {});
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email is already in use. Please use a different email.');
        }
        throw new Error('Failed to create judge account.');
    }
}

export async function approveStudent(collegeId: string, userId: string) {
    await updateDoc(doc(db, `colleges/${collegeId}/users`, userId), { status: 'approved' });
    return { successMessage: "Student approved successfully." };
}

export async function registerAndApproveStudent(collegeId: string, { name, email, password }: any) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser: User = {
            id: userCredential.user.uid,
            name,
            email,
            status: 'approved',
            skills: [], bio: '', github: '', linkedin: ''
        };
        await setDoc(doc(db, `colleges/${collegeId}/users`, newUser.id), newUser);
        await firebaseSignOut(auth);
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
    // This is complex. Deleting a Firebase Auth user is a privileged operation.
    // We can't do it from the client-side SDK directly for security reasons.
    // This requires a Cloud Function or Admin SDK.
    // For this implementation, we'll just delete the Firestore record.
    const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, userId));
    const user = userDoc.data() as User;

    if (user.teamId) {
        const teamDoc = await getDoc(doc(db, `colleges/${collegeId}/teams`, user.teamId));
        if (teamDoc.exists()) {
            const team = teamDoc.data() as Team;
            const updatedMembers = team.members.filter((m: any) => m.id !== userId);
            await updateDoc(teamDoc.ref, { members: updatedMembers });
        }
    }
    
    await deleteDoc(doc(db, `colleges/${collegeId}/users`, userId));

    return { successMessage: `Student ${user.name} has been removed.` };
}

export async function postAnnouncement(collegeId: string, message: string) {
    const newAnnouncement: Omit<Announcement, 'id'> = {
        message,
        timestamp: Date.now(),
    };
    await addDoc(collection(db, `colleges/${collegeId}/announcements`), newAnnouncement);
    return { successMessage: 'Announcement posted successfully.' };
}

export async function resetHackathon(collegeId: string) {
    // VERY DANGEROUS - Requires a backend function for security.
    // Simulating by clearing collections.
    const collections = ['users', 'teams', 'projects', 'judges', 'announcements'];
    for (const col of collections) {
        const q = query(collection(db, `colleges/${collegeId}/${col}`));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(docSnapshot.ref);
        });
    }
     return { successMessage: "All hackathon data for this college has been reset." };
}

// --- Student ---
export async function createTeam(collegeId: string, teamName: string, user: User) {
    const newTeam: Omit<Team, 'id'> = {
        name: teamName,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [user],
        projectId: ""
    };
    const teamRef = await addDoc(collection(db, `colleges/${collegeId}/teams`), newTeam);
    await updateDoc(doc(db, `colleges/${collegeId}/users`, user.id), { teamId: teamRef.id });
    return { successMessage: "Team created successfully!" };
}

export async function joinTeam(collegeId: string, joinCode: string, user: User) {
    const q = query(collection(db, `colleges/${collegeId}/teams`), where("joinCode", "==", joinCode));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        throw new Error("Invalid join code.");
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

export async function submitProject(collegeId: string, { name, description, githubUrl, teamId }: any) {
    const newProject: Omit<Project, 'id'> = {
        teamId,
        name,
        description,
        githubUrl,
        scores: [],
        averageScore: 0,
    };
    const projectRef = await addDoc(collection(db, `colleges/${collegeId}/projects`), newProject);
    await updateDoc(doc(db, `colleges/${collegeId}/teams`, teamId), { projectId: projectRef.id });
    return { successMessage: "Project submitted successfully!" };
}

export async function updateProfile(collegeId: string, userId: string, profileData: Partial<UserProfileData>) {
    await updateDoc(doc(db, `colleges/${collegeId}/users`, userId), profileData);
    return { successMessage: "Profile updated successfully." };
}

// --- Judge ---
export async function scoreProject(collegeId: string, projectId: string, judgeId: string, scores: Score[]) {
    const projectRef = doc(db, `colleges/${collegeId}/projects`, projectId);
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
