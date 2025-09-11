

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
    arrayRemove,
    orderBy,
    limit
} from 'firebase/firestore';
import { User, Judge, Team, Project, Score, UserProfileData, Announcement, Hackathon, ChatMessage, JoinRequest, TeamMember } from './types';
import { JUDGING_RUBRIC } from './constants';
import { generateProjectImage } from '@/ai/flows/generate-project-image';


async function getOrCreateUser(email: string, password: any) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        }
        throw error;
    }
}

async function getAuthUser(email: string, password: any) {
    try {
        await signInWithEmailAndPassword(auth, email, 'a-deliberately-wrong-password');
    } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } else if (error.code === 'auth/user-not-found') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } else {
            throw error;
        }
    }
    throw new Error('Unexpected authentication issue');
}


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

    const tempAuth = auth;
    const currentAuthUser = tempAuth.currentUser;
    
    try {
        const judgeAuthUser = await getAuthUser(email, password);
        
        const judge: Judge = { 
            id: judgeAuthUser.uid,
            name, 
            email,
        };
        await setDoc(doc(db, `colleges/${collegeId}/judges`, judge.id), judge);
        
        await firebaseSignOut(tempAuth);
        
        if (currentAuthUser && currentAuthUser.email !== email) {
        }

        return { successMessage: 'Judge added successfully! They can log in with the provided credentials.' };
    } catch (error: any) {
        if (tempAuth.currentUser && tempAuth.currentUser.email === email) {
            await firebaseSignOut(tempAuth).catch(() => {});
        }
        console.error("Error creating judge:", error);
        if (error.code === 'auth/email-already-in-use') {
             throw new Error('This email is already in use by a different user. Please use another email.');
        }
        throw new Error(`Failed to create judge account: ${error.message}`);
    }
}


export async function removeJudge(collegeId: string, judgeId: string) {
    await deleteDoc(doc(db, `colleges/${collegeId}/judges`, judgeId));
    return { successMessage: "Judge removed successfully." };
}

export async function approveStudent(collegeId: string, userId: string) {
    await updateDoc(doc(db, `colleges/${collegeId}/users`, userId), { status: 'approved' });
    return { successMessage: "Student approved successfully." };
}

export async function registerAndApproveStudent(collegeId: string, { name, email, password }: any) {
     const tempAuth = auth;
     const currentAuthUser = tempAuth.currentUser;

     try {
        const studentAuthUser = await getAuthUser(email, password);
        
        const newUser: User = {
            id: studentAuthUser.uid,
            name,
            email,
            status: 'approved',
            skills: [], bio: '', github: '', linkedin: '',
        };
        await setDoc(doc(db, `colleges/${collegeId}/users`, newUser.id), newUser);
        
        await firebaseSignOut(tempAuth);

        if (currentAuthUser && currentAuthUser.email !== email) {
        }

        return { successMessage: `${name} has been registered and approved.` };
    } catch(error: any) {
        if (tempAuth.currentUser && tempAuth.currentUser.email === email) {
             await firebaseSignOut(auth).catch(() => {});
        }
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email is already in use by a different account. Please use another email.');
        }
        throw new Error(`Failed to create student account: ${error.message}`);
    }
}


export async function removeStudent(collegeId: string, userId: string) {
    const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, userId));
    if (!userDoc.exists()) return { successMessage: "Student already removed." };
    
    const user = userDoc.data() as User;
    
    const teamsQuery = query(collection(db, `colleges/${collegeId}/teams`), where('members.id', '==', userId));
    const teamsSnapshot = await getDocs(teamsQuery);

    for (const teamDoc of teamsSnapshot.docs) {
        const team = teamDoc.data() as Team;
        const updatedMembers = team.members.filter(m => m.id !== userId);
        if (updatedMembers.length > 0) {
            await updateDoc(teamDoc.ref, { members: updatedMembers });
        } else {
            await deleteDoc(teamDoc.ref);
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


export async function postAnnouncement(collegeId: string, data: Partial<Omit<Announcement, 'id' | 'timestamp'>>) {
    const newAnnouncement: Omit<Announcement, 'id'> = {
        message: data.message!,
        timestamp: Date.now(),
    };
    if (data.publishAt) {
        newAnnouncement.publishAt = data.publishAt;
    }
    if (data.expiresAt) {
        newAnnouncement.expiresAt = data.expiresAt;
    }

    await addDoc(collection(db, `colleges/${collegeId}/announcements`), newAnnouncement);
    return { successMessage: 'Announcement posted successfully.' };
}

export async function updateAnnouncement(collegeId: string, announcementId: string, data: Partial<Omit<Announcement, 'id' | 'timestamp'>>) {
    const updateData: Partial<Announcement> = { message: data.message! };
    if (data.publishAt) {
        updateData.publishAt = data.publishAt;
    }
     if (data.expiresAt) {
        updateData.expiresAt = data.expiresAt;
    }
    await updateDoc(doc(db, `colleges/${collegeId}/announcements`, announcementId), updateData);
    return { successMessage: 'Announcement updated successfully.' };
}

export async function deleteAnnouncement(collegeId: string, announcementId: string) {
    await deleteDoc(doc(db, `colleges/${collegeId}/announcements`, announcementId));
    return { successMessage: 'Announcement deleted successfully.' };
}

// --- Student ---
export async function createTeam(collegeId: string, hackathonId: string, teamName: string, user: User) {
    const newTeam: Omit<Team, 'id'> = {
        name: teamName,
        creatorId: user.id,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [{ ...user, role: 'Leader' }],
        hackathonId,
        projectId: "",
        messages: [],
        joinRequests: [],
    };
    const teamRef = await addDoc(collection(db, `colleges/${collegeId}/teams`), newTeam);
    await updateDoc(doc(db, `colleges/${collegeId}/users`, user.id), { teamId: teamRef.id });

    return { successMessage: "Team created successfully!", teamId: teamRef.id };
}

export async function requestToJoinTeamByCode(collegeId: string, hackathonId: string, joinCode: string, user: User) {
    const userTeamsQuery = query(
        collection(db, `colleges/${collegeId}/teams`), 
        where("hackathonId", "==", hackathonId),
        where("members", "array-contains", {id: user.id, name: user.name, email: user.email})
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
    return requestToJoinTeamById(collegeId, hackathonId, teamDoc.id, user);
}

export async function requestToJoinTeamById(collegeId: string, hackathonId: string, teamId: string, user: User) {
    const userTeamsQuery = query(collection(db, `colleges/${collegeId}/teams`), 
        where('hackathonId', '==', hackathonId), 
        where('members', 'array-contains', {id: user.id, name: user.name, email: user.email})
    );

    const userTeamsSnapshot = await getDocs(userTeamsQuery);
    if (!userTeamsSnapshot.empty) {
        throw new Error("You are already in a team for this hackathon.");
    }

    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
        throw new Error("Team not found.");
    }

    const teamData = teamDoc.data() as Team;

    if (teamData.members.some(m => m.id === user.id) || teamData.joinRequests?.some(r => r.id === user.id)) {
        throw new Error("You have already joined or requested to join this team.");
    }

    const request: JoinRequest = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    await updateDoc(teamRef, {
        joinRequests: arrayUnion(request)
    });

    return { successMessage: `Your request to join "${teamData.name}" has been sent!` };
}


export async function handleJoinRequest(collegeId: string, teamId: string, request: JoinRequest, action: 'accept' | 'reject') {
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) throw new Error("Team not found.");
    const teamData = teamDoc.data() as Team;
    const hackathonDoc = await getDoc(doc(db, `colleges/${collegeId}/hackathons`, teamData.hackathonId));
    if (!hackathonDoc.exists()) throw new Error("Hackathon not found.");
    const hackathon = hackathonDoc.data() as Hackathon;

    if (action === 'accept') {
        if (teamData.members.length >= hackathon.teamSizeLimit) {
            await updateDoc(teamRef, { joinRequests: arrayRemove(request) });
            throw new Error(`Team has reached its maximum size of ${hackathon.teamSizeLimit} members.`);
        }
        
        const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, request.id));
        if(!userDoc.exists()) throw new Error("User trying to join does not exist.");
        
        const userData = userDoc.data() as User;
        const newMember: TeamMember = { ...userData, role: 'Member' };

        await updateDoc(teamRef, {
            members: arrayUnion(newMember),
            joinRequests: arrayRemove(request)
        });
        await updateDoc(doc(db, `colleges/${collegeId}/users`, request.id), { teamId: teamId });
        return { successMessage: `${request.name} has been added to the team.` };
    } else { // reject
        await updateDoc(teamRef, {
            joinRequests: arrayRemove(request)
        });
        return { successMessage: `Request from ${request.name} has been rejected.` };
    }
}

export async function removeTeammate(collegeId: string, teamId: string, memberToRemove: TeamMember) {
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);
    const userRef = doc(db, `colleges/${collegeId}/users`, memberToRemove.id);

    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) throw new Error("Team not found");
    const team = teamDoc.data() as Team;

    const memberObject = team.members.find(m => m.id === memberToRemove.id);
    if (!memberObject) throw new Error("Member not found in team");

    await updateDoc(teamRef, {
        members: arrayRemove(memberObject)
    });
    
    await updateDoc(userRef, {
      teamId: null
    });
    
    return { successMessage: `${memberToRemove.name} has been removed from the team.` };
}

export async function updateMemberRole(collegeId: string, teamId: string, memberId: string, newRole: string) {
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) throw new Error("Team not found");
    const team = teamDoc.data() as Team;
    
    const updatedMembers = team.members.map(member => {
        if (member.id === memberId) {
            return { ...member, role: newRole };
        }
        return member;
    });

    await updateDoc(teamRef, { members: updatedMembers });
    return { successMessage: "Member role updated." };
}

export async function leaveTeam(collegeId: string, teamId: string, userId: string) {
    const userRef = doc(db, `colleges/${collegeId}/users`, userId);
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);
    
    const teamDoc = await getDoc(teamRef);
    if (teamDoc.exists()) {
        const team = teamDoc.data() as Team;
        const memberObject = team.members.find(m => m.id === userId);

        if (!memberObject) return { successMessage: "You are not on this team." };

        const updatedMembers = team.members.filter(m => m.id !== userId);

        if (updatedMembers.length === 0) {
            await deleteDoc(teamRef);
        } else {
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

    await updateDoc(userRef, { teamId: null });
    
    return { successMessage: "You have left the team." };
}

export async function submitProject(collegeId: string, hackathonId: string, { name, description, githubUrl, teamId }: any) {
    const projectsCollection = collection(db, `colleges/${collegeId}/projects`);
    const q = query(projectsCollection, where("hackathonId", "==", hackathonId), orderBy("submittedAt", "asc"), limit(1));
    const querySnapshot = await getDocs(q);
    const isFirstSubmission = querySnapshot.empty;
    
    const newProject: Omit<Project, 'id'> = {
        teamId,
        hackathonId,
        name,
        description,
        githubUrl,
        scores: [],
        averageScore: 0,
        achievements: isFirstSubmission ? ['First Blood'] : [],
        submittedAt: Date.now(),
    };

    const projectRef = await addDoc(projectsCollection, newProject);
    await updateDoc(doc(db, `colleges/${collegeId}/teams`, teamId), { projectId: projectRef.id });

    // Asynchronously generate project image
    generateProjectImage({ projectName: name, projectDescription: description })
        .then(async (result) => {
            if (result.imageUrl) {
                await updateDoc(projectRef, { imageUrl: result.imageUrl });
            }
        })
        .catch(error => {
            console.error("Failed to generate project image:", error);
        });
    
    return { successMessage: "Project submitted successfully!" };
}

export async function updateProject(collegeId: string, projectId: string, projectData: Partial<Pick<Project, 'name' | 'description' | 'githubUrl'>>) {
    const projectRef = doc(db, `colleges/${collegeId}/projects`, projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
        throw new Error("Project not found");
    }

    const originalProject = projectDoc.data() as Project;
    await updateDoc(projectRef, projectData);

    // Check if name or description changed to regenerate the image
    if (projectData.name !== originalProject.name || projectData.description !== originalProject.description) {
         generateProjectImage({ projectName: projectData.name!, projectDescription: projectData.description! })
            .then(async (result) => {
                if (result.imageUrl) {
                    await updateDoc(projectRef, { imageUrl: result.imageUrl });
                }
            })
            .catch(error => {
                console.error("Failed to re-generate project image after update:", error);
            });
    }

    return { successMessage: "Project updated successfully." };
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

export async function saveGuidanceHistory(collegeId: string, userOrJudgeId: string, history: ChatMessage[], role: 'user' | 'judge') {
    const collectionName = role === 'user' ? 'users' : 'judges';
    const userRef = doc(db, `colleges/${collegeId}/${collectionName}`, userOrJudgeId);
    await updateDoc(userRef, { guidanceHistory: history });
    return { successMessage: "History saved." };
}

export async function clearGuidanceHistory(collegeId: string, userOrJudgeId: string, role: 'user' | 'judge') {
    const collectionName = role === 'user' ? 'users' : 'judges';
    const userRef = doc(db, `colleges/${collegeId}/${collectionName}`, userOrJudgeId);
    await updateDoc(userRef, { guidanceHistory: [] });
    return { successMessage: "Chat history cleared." };
}


// --- Judge ---
export async function scoreProject(collegeId: string, hackathonId: string, projectId: string, judgeId: string, scores: Score[]) {
    const projectRef = doc(db, `colleges/${collegeId}/projects`, projectId);
    const projectDoc = await getDoc(projectRef);
    if(!projectDoc.exists()) throw new Error("Project not found.");
    const project = projectDoc.data() as Project;

    // Remove old scores from this judge for both team and individuals
    const otherJudgesScores = project.scores.filter(s => s.judgeId !== judgeId);
    const newScores = [...otherJudgesScores, ...scores];

    const teamScores = newScores.filter(s => !s.memberId);
    
    const uniqueJudges = new Set(teamScores.map(s => s.judgeId));
    let totalScore = 0;
    
    uniqueJudges.forEach(id => {
        const judgeScores = teamScores.filter(s => s.judgeId === id);
        const rubricMax = JUDGING_RUBRIC.reduce((sum, c) => sum + c.max, 0);
        const judgeTotal = judgeScores.reduce((sum, score) => sum + score.value, 0);
        const scaledJudgeTotal = (judgeTotal / rubricMax) * 10;
        totalScore += scaledJudgeTotal;
    });

    const averageScore = uniqueJudges.size > 0 ? (totalScore / uniqueJudges.size) : 0;
    
    // --- Achievement Logic ---
    const newAchievements = new Set(project.achievements || []);
    scores.forEach(score => {
        if (score.criteria === 'innovation' && score.value === 10) {
            newAchievements.add("Innovator's Spark");
        }
        if (score.criteria === 'ui_ux' && score.value === 10) {
            newAchievements.add("Design Virtuoso");
        }
    });

    await updateDoc(projectRef, { 
        scores: newScores, 
        averageScore: averageScore,
        achievements: Array.from(newAchievements),
    });
    return { successMessage: "Scores submitted successfully." };
}
