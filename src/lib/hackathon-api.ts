

"use client";

import { auth, db } from './firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    sendEmailVerification,
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
    limit,
    writeBatch
} from 'firebase/firestore';
import { User, Judge, Team, Project, Score, UserProfileData, Announcement, Hackathon, ChatMessage, JoinRequest, TeamMember, SupportTicket, SupportTicketResponse, Notification } from './types';
import { JUDGING_RUBRIC, INDIVIDUAL_JUDGING_RUBRIC } from './constants';
import { generateProjectImage } from '@/ai/flows/generate-project-image';
import { triageSupportTicket } from '@/ai/flows/triage-support-ticket';


async function getAuthUser(email: string, password: any) {
    try {
        // Attempt to create a new user.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        // If the email is already in use, sign in instead.
        if (error.code === 'auth/email-already-in-use') {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        }
        // Re-throw other errors (e.g., weak-password).
        throw error;
    }
}


// --- Auth ---

export async function sendPasswordResetEmail(collegeId: string, email: string) {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
        return { successMessage: 'A password reset email has been sent. Please check your inbox (and spam folder).' };
    } catch(error: any) {
        console.warn("Could not send password reset email. This might be because the user doesn't exist or due to a network error.", error.message);
        return { successMessage: 'If an account exists for this email, a password reset link has been sent. Please check your inbox.' };
    }
}

export async function resendVerificationEmail(collegeId: string, email: string) {
    try {
        // To resend a verification email, we need an authenticated user object.
        // This is a client-side simulation. For this to work without asking for a password,
        // we'd typically use a backend function. Here, we'll guide the user.
        // The core logic is now in the `loginStudent` function, which re-sends the email
        // if a user tries to log in with an unverified account.
        
        // This function will now just return a helpful message.
        return { successMessage: 'To get a new verification link, please try logging in again. A new email will be sent automatically if your account is not yet verified.' };

    } catch (error: any) {
        console.error("Error resending verification email:", error);
        throw new Error("Could not resend verification email at this time. Please try logging in to trigger a new one.");
    }
}


export async function changePassword(collegeId: string, { oldPassword, newPassword }: any) {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("You must be logged in to change your password.");
    }

    const credential = EmailAuthProvider.credential(user.email, oldPassword);

    try {
        await reauthenticateWithCredential(user, credential);
        // User re-authenticated successfully. Now change the password.
        await updatePassword(user, newPassword);
        return { successMessage: "Your password has been changed successfully." };
    } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
            throw new Error("The old password you entered is incorrect. Please try again.");
        }
        console.error("Password change error:", error);
        throw new Error("An error occurred while changing your password.");
    }
}

let adminPassword = 'hack123'; // In-memory password

export async function changeAdminPassword(collegeId: string, { oldPassword, newPassword }: { oldPassword: string, newPassword: string }) {
    if (oldPassword !== adminPassword) {
        throw new Error("The old admin password you entered is incorrect.");
    }
    adminPassword = newPassword;
    return { successMessage: "Admin password has been changed successfully for this session." };
}

export async function registerStudent(collegeId: string, { name, email, password }: any) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user: User = {
            id: userCredential.user.uid,
            name,
            email,
            status: 'pending',
            registeredAt: Date.now(),
            skills: [],
            bio: '',
            github: '',
            linkedin: '',
            workStyle: [],
            notifications: [],
        };
        await setDoc(doc(db, `colleges/${collegeId}/users`, user.id), user);
        
        // Send verification email using Firebase's default flow
        await sendEmailVerification(userCredential.user);
        
        await firebaseSignOut(auth); // Sign out immediately after registration
        return { successMessage: 'Registration successful! A verification link has been sent to your email. Please verify your email AND wait for admin approval to log in.' };
    } catch(error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already registered. Please try logging in instead.');
        }
        throw error;
    }
}

export async function loginStudent(collegeId: string, { email, password }: any) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, userCredential.user.uid));
    
    // After a successful sign-in, Firebase automatically refreshes the user's state, including emailVerified
    const loggedInUser = auth.currentUser;
    if (!loggedInUser) {
        // This should not happen if signInWithEmailAndPassword succeeded, but as a safeguard:
        await firebaseSignOut(auth);
        throw new Error("Could not verify user session. Please try again.");
    }
    
    if (!loggedInUser.emailVerified) {
        // If the email is not verified, send a new verification email.
        await sendEmailVerification(loggedInUser);
        await firebaseSignOut(auth);
        throw new Error("Your email is not verified. We've sent a new verification link to your inbox. Please check it and try again.");
    }
    
    if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        throw new Error("Student record not found for this college.");
    }

    const user = userDoc.data() as User;
    if (user.status !== 'approved') {
        await firebaseSignOut(auth);
        throw new Error("Your account is still pending approval by an admin. You can check your status using the 'Check Status' tool.");
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
    if (email !== 'hacksprint@admin.com' || password !== adminPassword) {
        throw new Error('Invalid admin credentials.');
    }
    return { successMessage: 'Admin login successful!', isAdmin: true };
}


export async function signOut() {
    await firebaseSignOut(auth);
    return { successMessage: 'You have been logged out.' };
}

export async function getAccountStatus(collegeId: string, email: string) {
    const q = query(collection(db, `colleges/${collegeId}/users`), where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null; // No user found
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as User;
    
    // To get the real email verification status, we need to sign the user in temporarily.
    // This is a "hack" for client-side to get an Auth object. It's not ideal for production.
    // A better way is an admin SDK on a backend.
    let emailVerified = false;
    try {
        // This is a trick: we can't get the user by email from the client Auth SDK.
        // But if we have a user in our DB, we can attempt a sign-in with a dummy password.
        // The error will tell us if it's a wrong password (meaning user exists in Auth)
        // or user-not-found. This is still not giving us the `emailVerified` status.
        // The most reliable way without a password is to use a backend.
        // For this demo, we will simulate this by checking if they are the currently logged in user.
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email === email) {
            await currentUser.reload(); // Make sure we have the latest state
            emailVerified = currentUser.emailVerified;
        } else {
            // Since we can't securely get the verification status of another user from the client,
            // we will simulate it. We'll assume not verified unless approved. A real-world app
            // would use a backend Cloud Function to get the real status.
            emailVerified = userData.status === 'approved';
        }
    } catch(e) {
        // Ignore sign-in errors, we just want to know if the user exists.
    }


    return {
        userId: userData.id,
        approvalStatus: userData.status,
        emailVerified: emailVerified,
        registeredAt: userData.registeredAt || null,
    };
}

export async function remindAdminForApproval(collegeId: string, userId: string, studentEmail: string) {
    const userRef = doc(db, `colleges/${collegeId}/users`, userId);
    await updateDoc(userRef, { approvalReminderSentAt: Date.now() });

    // Create a notification to be fanned out to all judges.
    const studentDoc = await getDoc(userRef);
    const studentName = studentDoc.data()?.name || studentEmail;

    const notification: Omit<Notification, 'id'> = {
        message: `[URGENT] ${studentName} is waiting for registration approval.`,
        link: `/admin?tab=urgent-approvals`,
        timestamp: Date.now(),
        isRead: false,
    };

    // Fetch all judges and add the notification to each one.
    const judgesQuery = query(collection(db, `colleges/${collegeId}/judges`));
    const judgesSnapshot = await getDocs(judgesQuery);

    const batch = writeBatch(db);
    judgesSnapshot.forEach(judgeDoc => {
        const judgeRef = doc(db, `colleges/${collegeId}/judges`, judgeDoc.id);
        const newNotification = { ...notification, id: doc(collection(db, 'dummy')).id };
        batch.update(judgeRef, {
            notifications: arrayUnion(newNotification)
        });
    });

    await batch.commit();
    
    return { successMessage: "A reminder has been sent to all administrators and judges." };
}

// --- Admin & Judge ---

export async function addJudge(collegeId: string, { name, email, password, gender, contactNumber, bio }: any) {
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
            gender,
            contactNumber,
            bio,
            notifications: [],
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

export async function updateJudgeProfile(collegeId: string, judgeId: string, profileData: Partial<Pick<Judge, 'name' | 'gender' | 'contactNumber' | 'bio'>>) {
    await updateDoc(doc(db, `colleges/${collegeId}/judges`, judgeId), profileData);
    return { successMessage: "Profile updated successfully." };
}


export async function removeJudge(collegeId: string, judgeId: string) {
    await deleteDoc(doc(db, `colleges/${collegeId}/judges`, judgeId));
    return { successMessage: "Judge removed successfully." };
}

export async function approveStudent(collegeId: string, userId: string) {
    const userRef = doc(db, `colleges/${collegeId}/users`, userId);
    await updateDoc(userRef, { status: 'approved', approvalReminderSentAt: null }); // Clear reminder on approval

    // Create a notification for the student
    const notification = {
        id: doc(collection(db, 'dummy')).id,
        message: "Welcome to HackSprint! Your registration has been approved. Time to build something amazing.",
        link: `/student`,
        timestamp: Date.now(),
        isRead: false,
    };
    await updateDoc(userRef, {
        notifications: arrayUnion(notification)
    });

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
            registeredAt: Date.now(),
            skills: [], bio: '', github: '', linkedin: '', workStyle: [], notifications: [],
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

export async function updateProjectImage(collegeId: string, projectId: string, imageUrl: string) {
    await updateDoc(doc(db, `colleges/${collegeId}/projects`, projectId), { imageUrl });
    return { successMessage: "Project image updated." };
}

export async function postAnnouncement(collegeId: string, data: Partial<Omit<Announcement, 'id' | 'timestamp'>>) {
    const newAnnouncement: Partial<Omit<Announcement, 'id'>> = {
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
    const q = query(projectsCollection, where("hackathonId", "==", hackathonId));
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
            if (result && result.imageUrl) {
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
                if (result && result.imageUrl) {
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
        // Correct scaling: Divide by sum of max points for criteria that were actually scored
        const scoredCriteriaIds = new Set(judgeScores.map(s => s.criteria));
        const scoredRubricMax = JUDGING_RUBRIC.filter(c => scoredCriteriaIds.has(c.id)).reduce((sum, c) => sum + c.max, 0);
        
        if (scoredRubricMax > 0) {
            const scaledJudgeTotal = (judgeTotal / scoredRubricMax) * 10;
            totalScore += scaledJudgeTotal;
        }
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
         if (score.criteria === 'technical_complexity' && score.value === 10) {
            newAchievements.add("Code Wizard");
        }
    });

    await updateDoc(projectRef, { 
        scores: newScores, 
        averageScore: averageScore,
        achievements: Array.from(newAchievements),
    });
    return { successMessage: "Scores submitted successfully." };
}

// --- Support ---
export async function submitSupportTicket(collegeId: string, ticketData: Omit<SupportTicket, 'id' | 'submittedAt' | 'status' | 'category' | 'priority' | 'suggestedResponse'>) {
    
    const triageResult = await triageSupportTicket({
        subject: ticketData.subject,
        question: ticketData.question,
        studentName: ticketData.studentName
    });
    
    if (!triageResult) {
        throw new Error("AI Triage failed. Could not submit ticket.");
    }
    
    const newTicket: Omit<SupportTicket, 'id'> = {
        ...ticketData,
        submittedAt: Date.now(),
        status: 'New',
        responses: [],
        ...triageResult
    };

    const ticketRef = await addDoc(collection(db, `colleges/${collegeId}/supportTickets`), newTicket);
    return { successMessage: "Support ticket submitted successfully. An admin will get back to you shortly.", id: ticketRef.id };
}

export async function updateSupportTicketStatus(collegeId: string, ticketId: string, status: SupportTicket['status']) {
    await updateDoc(doc(db, `colleges/${collegeId}/supportTickets`, ticketId), { status });
    return { successMessage: "Ticket status updated." };
}

export async function sendSupportResponse(collegeId: string, ticketId: string, admin: User | Judge, message: string) {
    const ticketRef = doc(db, `colleges/${collegeId}/supportTickets`, ticketId);
    const ticketDoc = await getDoc(ticketRef);
    if (!ticketDoc.exists()) throw new Error("Ticket not found.");
    const ticket = ticketDoc.data() as SupportTicket;
    
    const response: SupportTicketResponse = {
        id: doc(collection(db, 'dummy')).id,
        adminId: admin.id,
        adminName: admin.name,
        message,
        timestamp: Date.now(),
    };

    await updateDoc(ticketRef, {
        responses: arrayUnion(response),
        status: 'In Progress' // Automatically move to in progress on reply
    });

    // Create a notification for the student
    const studentRef = doc(db, `colleges/${collegeId}/users`, ticket.studentId);
    const notification = {
        id: doc(collection(db, 'dummy')).id,
        message: `Admin ${admin.name.split(' ')[0]} replied to your ticket: "${ticket.subject}"`,
        link: `/support/tickets/${ticketId}`,
        timestamp: Date.now(),
        isRead: false,
    };
    await updateDoc(studentRef, {
        notifications: arrayUnion(notification)
    });

    return { successMessage: "Response sent to student." };
}

export async function markNotificationsAsRead(collegeId: string, userId: string, notificationIds: string[], role: 'user' | 'judge') {
    const collectionName = role === 'user' ? 'users' : 'judges';
    const userRef = doc(db, `colleges/${collegeId}/${collectionName}`, userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User not found");

    const user = userDoc.data() as User | Judge;
    const updatedNotifications = (user.notifications || []).map(n => 
        notificationIds.includes(n.id) ? { ...n, isRead: true } : n
    );

    await updateDoc(userRef, { notifications: updatedNotifications });
    return { successMessage: "Notifications marked as read." };
}


// --- Data Reset Functions ---

export async function resetCurrentHackathon(collegeId: string, hackathonId: string) {
    const batch = writeBatch(db);

    // Delete projects for the hackathon
    const projectsQuery = query(collection(db, `colleges/${collegeId}/projects`), where("hackathonId", "==", hackathonId));
    const projectsSnapshot = await getDocs(projectsQuery);
    projectsSnapshot.forEach(doc => batch.delete(doc.ref));

    // Delete teams for the hackathon
    const teamsQuery = query(collection(db, `colleges/${collegeId}/teams`), where("hackathonId", "==", hackathonId));
    const teamsSnapshot = await getDocs(teamsQuery);
    teamsSnapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    return { successMessage: "Current hackathon data has been reset." };
}

export async function resetAllHackathons(collegeId: string) {
    const batch = writeBatch(db);

    const collectionsToReset = ['hackathons', 'projects', 'teams'];
    for (const col of collectionsToReset) {
        const querySnapshot = await getDocs(collection(db, `colleges/${collegeId}/${col}`));
        querySnapshot.forEach(doc => batch.delete(doc.ref));
    }

    await batch.commit();
    return { successMessage: "All hackathon data has been reset." };
}

export async function resetAllUsers(collegeId: string) {
    // This is a very destructive operation and should ideally be handled by a backend function
    // with proper admin authentication for security. The client-side approach is for demonstration.
    
    const batch = writeBatch(db);
    const usersQuery = query(collection(db, `colleges/${collegeId}/users`));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
        return { successMessage: "No users to reset." };
    }

    usersSnapshot.forEach(doc => {
        batch.delete(doc.ref);
        // Note: This does NOT delete users from Firebase Auth. 
        // Deleting from Auth is a protected operation that can't be safely done in batch from the client.
        // A real app would use a Cloud Function triggered by the Firestore deletion or an admin SDK.
    });

    await batch.commit();
    
    return { successMessage: "All user records have been deleted from the database. Auth accounts may still exist." };
}
