
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
    deleteDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { User, Judge, Team, Project, Score, UserProfileData, Announcement, Hackathon, ChatMessage, JoinRequest } from './types';

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
    await firebaseSignOut(auth); // Sign out immediately after registration
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
    
    const teamsQuery = query(collection(db, `colleges/${collegeId}/teams`), where('members', 'array-contains', {id: userId, name: user.name, email: user.email}));
    const teamsSnapshot = await getDocs(teamsQuery);

    teamsSnapshot.forEach(async (teamDoc) => {
        const team = teamDoc.data() as Team;
        const updatedMembers = team.members.filter(m => m.id !== userId);
        if (updatedMembers.length > 0) {
            await updateDoc(teamDoc.ref, { members: updatedMembers });
        } else {
            await deleteDoc(teamDoc.ref);
        }
    });
    
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
export async function createTeam(collegeId: string, hackathonId: string, teamName: string, user: User) {
    const newTeam: Omit<Team, 'id'> = {
        name: teamName,
        creatorId: user.id,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [{ id: user.id, name: user.name, email: user.email, skills: user.skills, bio: user.bio, github: user.github, linkedin: user.linkedin, status: user.status }],
        hackathonId,
        projectId: "",
        messages: [],
    };
    const teamRef = await addDoc(collection(db, `colleges/${collegeId}/teams`), newTeam);
    return { successMessage: "Team created successfully!", teamId: teamRef.id };
}

export async function joinTeamByCode(collegeId: string, hackathonId: string, joinCode: string, user: User) {
    const hackathonDocRef = doc(db, `colleges/${collegeId}/hackathons`, hackathonId);
    const hackathonDoc = await getDoc(hackathonDocRef);
    if (!hackathonDoc.exists()) {
        throw new Error("Hackathon not found.");
    }
    const hackathon = hackathonDoc.data() as Hackathon;
    const teamSizeLimit = hackathon.teamSizeLimit;

    // Check if user is already on a team for this hackathon
    const userTeamsQuery = query(
        collection(db, `colleges/${collegeId}/teams`), 
        where("hackathonId", "==", hackathonId),
        where("members", "array-contains", {id: user.id, name: user.name, email: user.email, skills: user.skills, bio: user.bio, github: user.github, linkedin: user.linkedin, status: user.status})
    );
    const userTeamsSnapshot = await getDocs(userTeamsQuery);
    if (!userTeamsSnapshot.empty) {
        throw new Error("You are already in a team for this hackathon.");
    }
    
    const q = query(collection(db, `colleges/${collegeId}/teams`), where("joinCode", "==", joinCode), where("hackathonId", "==", hackathonId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error("Invalid join code for this hackathon.");
    }

    const teamDoc = querySnapshot.docs[0];
    const teamData = teamDoc.data() as Team;

    if (teamData.members.length >= teamSizeLimit) {
        throw new Error(`This team has reached the maximum size of ${teamSizeLimit} members.`);
    }
    
    const memberToAdd = { id: user.id, name: user.name, email: user.email, skills: user.skills, bio: user.bio, github: user.github, linkedin: user.linkedin, status: user.status };

    await updateDoc(teamDoc.ref, {
        members: arrayUnion(memberToAdd)
    });

    return { successMessage: `Successfully joined team "${teamData.name}"!` };
}

export async function handleJoinRequest(collegeId: string, teamId: string, request: JoinRequest, action: 'accept' | 'reject') {
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);

    if (action === 'accept') {
        const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, request.id));
        if(!userDoc.exists()) throw new Error("User trying to join does not exist.");
        
        const userData = userDoc.data() as User;

        await updateDoc(teamRef, {
            members: arrayUnion({id: userData.id, name: userData.name, email: userData.email, skills: userData.skills, bio: userData.bio, github: userData.github, linkedin: userData.linkedin, status: userData.status}),
            joinRequests: arrayRemove(request)
        });
        return { successMessage: `${request.name} has been added to the team.` };
    } else { // reject
        await updateDoc(teamRef, {
            joinRequests: arrayRemove(request)
        });
        return { successMessage: `Request from ${request.name} has been rejected.` };
    }
}

export async function removeTeammate(collegeId: string, teamId: string, memberToRemove: User) {
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);

    // Construct the object to remove, ensuring it matches what's in the array
    const memberObject = {
        id: memberToRemove.id,
        name: memberToRemove.name,
        email: memberToRemove.email,
        skills: memberToRemove.skills,
        bio: memberToRemove.bio,
        github: memberToRemove.github,
        linkedin: memberToRemove.linkedin,
        status: memberToRemove.status,
    };

    await updateDoc(teamRef, {
        members: arrayRemove(memberObject)
    });
    
    return { successMessage: `${memberToRemove.name} has been removed from the team.` };
}

export async function leaveTeam(collegeId: string, hackathonId: string, teamId: string, userId: string) {
    const userRef = doc(db, `colleges/${collegeId}/users`, userId);
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);
    
    const userDoc = await getDoc(userRef);
    const user = userDoc.data() as User;

    const teamDoc = await getDoc(teamRef);
    if (teamDoc.exists()) {
        const team = teamDoc.data() as Team;

        const memberObject = team.members.find(m => m.id === userId);

        if (!memberObject) {
             return { successMessage: "You are not on this team." };
        }

        const updatedMembers = team.members.filter(m => m.id !== userId);

        if (updatedMembers.length === 0) {
            await deleteDoc(teamRef);
        } else {
            // If the creator leaves, assign a new creator
            if (team.creatorId === userId) {
                await updateDoc(teamRef, { 
                    members: arrayRemove(memberObject),
                    creatorId: updatedMembers[0].id
                });
            } else {
                 await updateDoc(teamRef, { members: arrayRemove(memberObject) });
            }
        }
    }
    
    return { successMessage: "You have left the team." };
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
    const projectRef = await addDoc(collection(db, `colleges/${collegeId}/projects`), newProject);
    await updateDoc(doc(db, `colleges/${collegeId}/teams`, teamId), { projectId: projectRef.id });
    return { successMessage: "Project submitted successfully!" };
}

export async function updateProfile(collegeId: string, userId: string, profileData: Partial<UserProfileData>) {
    await updateDoc(doc(db, `colleges/${collegeId}/users`, userId), profileData);
    return { successMessage: "Profile updated successfully." };
}

export async function postTeamMessage(collegeId: string, teamId: string, message: Omit<ChatMessage, 'id'>) {
    const newMessage = { ...message, id: doc(collection(db, 'dummy')).id }; // Generate a unique ID locally
    await updateDoc(doc(db, `colleges/${collegeId}/teams`, teamId), {
        messages: arrayUnion(newMessage)
    });
    return { successMessage: "Message sent." };
}


// --- Judge ---
export async function scoreProject(collegeId: string, hackathonId: string, projectId: string, judgeId: string, scores: Score[]) {
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
