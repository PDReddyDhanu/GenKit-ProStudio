
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
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "firebase/storage";
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
import { User, Faculty, Team, ProjectSubmission, Score, UserProfileData, Announcement, ChatMessage, JoinRequest, TeamMember, SupportTicket, SupportResponse, Notification, ProjectIdea } from './types';
import { EVALUATION_RUBRIC, INDIVIDUAL_EVALUATION_RUBRIC } from './constants';
import { generateProjectImage } from '@/ai/flows/generate-project-image';
import { triageSupportTicket } from '@/ai/flows/triage-support-ticket';

const storage = getStorage();

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
        const tempUser = auth.currentUser;
        if(tempUser && tempUser.email === email && !tempUser.emailVerified) {
             await sendEmailVerification(tempUser);
             return { successMessage: "A new verification email has been sent to your inbox." };
        }
        throw new Error("Could not find a logged-in user matching this email. Please try logging in to trigger a new verification email.");

    } catch (error: any) {
        console.error("Error resending verification email:", error);
         return { successMessage: "To get a new verification link, please try logging in again. A new email will be sent automatically if your account is not yet verified." };
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

let adminPassword = 'prostudio0408';

export async function changeAdminPassword(collegeId: string, { oldPassword, newPassword }: { oldPassword: string, newPassword: string }) {
    if (oldPassword !== adminPassword) {
        throw new Error("The old admin password you entered is incorrect.");
    }
    adminPassword = newPassword;
    return { successMessage: "Admin password has been changed successfully for this session." };
}

export async function registerStudent(collegeId: string, { name, email, password, rollNo, branch, department, section, contactNumber }: any) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user: User = {
            id: userCredential.user.uid,
            name,
            email,
            rollNo,
            branch,
            department,
            section,
            contactNumber,
            status: 'pending',
            registeredAt: Date.now(),
            skills: [],
            bio: '',
            github: '',
            linkedin: '',
            workStyle: [],
            notifications: [],
            projectType: 'Other', // Default value
        };
        await setDoc(doc(db, `colleges/${collegeId}/users`, user.id), user);
        
        await sendEmailVerification(userCredential.user);
        await firebaseSignOut(auth);
        return { successMessage: 'Registration successful! A verification link has been sent to your email. Please verify your email AND wait for admin approval to log in.' };
    } catch(error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already registered. Please try logging in instead.');
        }
        throw error;
    }
}

export async function loginStudent(collegeId: string, { email, password }: any) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, userCredential.user.uid));
        
        const loggedInUser = auth.currentUser;
        if (!loggedInUser) {
            await firebaseSignOut(auth);
            throw new Error("Could not verify user session. Please try again.");
        }
        
        if (!userDoc.exists()) {
             // Check if they are a faculty member trying to log in as a student
            const facultyDoc = await getDoc(doc(db, `colleges/${collegeId}/faculty`, userCredential.user.uid));
            await firebaseSignOut(auth);
            if (facultyDoc.exists()) {
                throw new Error("This is a faculty account. Please use the Faculty/Admin portal to log in.");
            }
            throw new Error("Student record not found for this college. Please ensure you have selected the correct college or have registered.");
        }

        const user = userDoc.data() as User;
        if (user.status !== 'approved') {
             await firebaseSignOut(auth);
            throw new Error("Your account is still pending approval by an admin. You can check your status using the 'Check Status' tool.");
        }

        if (!loggedInUser.emailVerified) {
            await sendEmailVerification(loggedInUser);
            await firebaseSignOut(auth);
            throw new Error("Your email is not verified. We've sent a new verification link to your inbox. Please check it and try again.");
        }
        
        return { successMessage: 'Login successful!' };
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
             throw new Error("Invalid email or password. Please try again.");
        }
        throw error;
    }
}

export async function registerFaculty(collegeId: string, data: Partial<Faculty> & { password?: string }) {
    const { name, email, password, role } = data;
    if (!email || !password || !name || !role) {
        throw new Error("Missing required fields for faculty registration.");
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const facultyData: Omit<Faculty, 'id'> = {
            ...data,
            status: 'pending',
            notifications: [],
        };
        await setDoc(doc(db, `colleges/${collegeId}/faculty`, userCredential.user.uid), facultyData);

        await sendEmailVerification(userCredential.user);
        await firebaseSignOut(auth);
        return { successMessage: 'Registration successful! An admin will review your request. Please wait for approval.' };
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already registered.');
        }
        throw error;
    }
}

export async function loginFaculty(collegeId: string, { email, password }: { email: string; password: any; }) {
    const collegeNamePrefix = collegeId.replace(/\s/g, '').toLowerCase();
    const subAdminEmail = `${collegeNamePrefix.substring(0, 6)}@subadmin.com`;
    const subAdminPassword = collegeNamePrefix.substring(0, 8);

    if (email.toLowerCase() === subAdminEmail && password === subAdminPassword) {
        const subAdminUser: Faculty = {
            id: 'subadmin',
            name: `${collegeId} Sub-Admin`,
            email: email,
            role: 'admin', // Treat as admin for permissions
            notifications: [],
        };
        return { successMessage: 'Sub-Admin login successful!', faculty: subAdminUser };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const facultyDoc = await getDoc(doc(db, `colleges/${collegeId}/faculty`, userCredential.user.uid));
        if (!facultyDoc.exists()) {
            await firebaseSignOut(auth);
            throw new Error("Faculty record not found for this college.");
        }
        
        const faculty = facultyDoc.data() as Faculty;
        if (faculty.status !== 'approved') {
            await firebaseSignOut(auth);
            throw new Error("Your faculty account is pending admin approval.");
        }
        
        return { successMessage: 'Login successful!' };
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error("Invalid email or password.");
        }
        throw error;
    }
}


export async function loginAdmin({ email, password }: any) {
    if (email !== 'genkit@admin.com' || password !== adminPassword) {
        throw new Error('Invalid admin credentials.');
    }
    return { successMessage: 'Admin login successful!', isAdmin: true };
}


export async function signOut() {
    await firebaseSignOut(auth);
    return { successMessage: 'You have been logged out.' };
}

export async function getAccountStatus(collegeId: string, email: string) {
    const userQuery = query(collection(db, `colleges/${collegeId}/users`), where("email", "==", email), limit(1));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data() as User;
        
        let emailVerified = auth.currentUser?.email === email ? auth.currentUser.emailVerified : userData.status === 'approved';

        return {
            userId: userData.id,
            approvalStatus: userData.status,
            emailVerified: emailVerified,
            registeredAt: userData.registeredAt || null,
        };
    }
    
    const facultyQuery = query(collection(db, `colleges/${collegeId}/faculty`), where("email", "==", email), limit(1));
    const facultySnapshot = await getDocs(facultyQuery);

    if (!facultySnapshot.empty) {
        const facultyDoc = facultySnapshot.docs[0];
        const facultyData = facultyDoc.data() as Faculty;
        return {
            userId: facultyData.id,
            approvalStatus: facultyData.status,
            emailVerified: auth.currentUser?.email === email ? auth.currentUser.emailVerified : facultyData.status === 'approved',
            registeredAt: null, // Faculty doesn't have this field yet
        };
    }

    return null;
}

export async function remindAdminForApproval(collegeId: string, userId: string, studentEmail: string) {
    const userRef = doc(db, `colleges/${collegeId}/users`, userId);
    await updateDoc(userRef, { approvalReminderSentAt: Date.now() });

    const studentDoc = await getDoc(userRef);
    const studentName = studentDoc.data()?.name || studentEmail;

    const notification: Omit<Notification, 'id'> = {
        message: `[URGENT] ${studentName} is waiting for registration approval.`,
        link: `/admin?tab=urgent-approvals`,
        timestamp: Date.now(),
        isRead: false,
    };

    const facultyQuery = query(collection(db, `colleges/${collegeId}/faculty`));
    const facultySnapshot = await getDocs(facultyQuery);

    const batch = writeBatch(db);
    facultySnapshot.forEach(facultyDoc => {
        const facultyRef = doc(db, `colleges/${collegeId}/faculty`, facultyDoc.id);
        const newNotification = { ...notification, id: doc(collection(db, 'dummy')).id };
        batch.update(facultyRef, {
            notifications: arrayUnion(newNotification)
        });
    });

    await batch.commit();
    
    return { successMessage: "A reminder has been sent to all administrators and faculty." };
}

// --- Admin & Faculty ---

export async function addFaculty(collegeId: string, data: Partial<Faculty> & { password?: string }) {
    const { name, email, password, role, gender, contactNumber, bio, designation, education, branch, department, collegeName } = data;

    if (!email || !password || !name || !role) {
        throw new Error("Missing required fields for faculty creation.");
    }
    
    const currentAuthUser = auth.currentUser;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const facultyAuthUser = userCredential.user;

        const facultyMember: Omit<Faculty, 'id'> = { 
            name, 
            email,
            role,
            gender,
            contactNumber,
            bio,
            notifications: [],
            designation,
            education,
            branch,
            department,
            collegeName,
            status: 'approved', // Directly approve when admin adds
        };
        await setDoc(doc(db, `colleges/${collegeId}/faculty`, facultyAuthUser.uid), facultyMember);

        if (auth.currentUser?.uid !== currentAuthUser?.uid) {
            await firebaseSignOut(auth);
        }
        
        return { successMessage: 'Faculty member added and approved successfully! They can now log in.' };
    } catch (error: any) {
        console.error("Error creating faculty member:", error);
        if (error.code === 'auth/email-already-in-use') {
             throw new Error('This email is already in use. Please choose another email.');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('The password is too weak. Please use a stronger password.');
        }
        throw new Error(`Failed to create faculty account: ${error.message}`);
    }
}

export async function approveFaculty(collegeId: string, facultyId: string) {
    await updateDoc(doc(db, `colleges/${collegeId}/faculty`, facultyId), { status: 'approved' });
    return { successMessage: 'Faculty member has been approved.' };
}

export async function updateFacultyProfile(collegeId: string, facultyId: string, profileData: Partial<Pick<Faculty, 'name' | 'gender' | 'contactNumber' | 'bio'>>) {
    await updateDoc(doc(db, `colleges/${collegeId}/faculty`, facultyId), profileData);
    return { successMessage: "Profile updated successfully." };
}


export async function removeFaculty(collegeId: string, facultyId: string) {
    await deleteDoc(doc(db, `colleges/${collegeId}/faculty`, facultyId));
    // Note: This does not delete the user from Firebase Auth.
    return { successMessage: "Faculty member removed successfully." };
}

export async function approveStudent(collegeId: string, userId: string) {
    const userRef = doc(db, `colleges/${collegeId}/users`, userId);
    await updateDoc(userRef, { status: 'approved', approvalReminderSentAt: null });

    const notification = {
        id: doc(collection(db, 'dummy')).id,
        message: "Welcome to GenKit ProStudio! Your registration has been approved. Time to build something amazing.",
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
     try {
        const studentAuthUser = await getAuthUser(email, password);
        
        const newUser: User = {
            id: studentAuthUser.uid,
            name,
            email,
            status: 'approved',
            registeredAt: Date.now(),
            skills: [], bio: '', github: '', linkedin: '', workStyle: [], notifications: [],
            rollNo: '', branch: '', department: '', section: '', contactNumber: '',
            projectType: 'Other',
        };
        await setDoc(doc(db, `colleges/${collegeId}/users`, newUser.id), newUser);
        
        return { successMessage: `${name} has been registered and approved.` };
    } catch(error: any) {
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
        hackathonId: hackathonId,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [{ ...user, role: 'Leader' }],
        submissionId: "",
        messages: [],
        joinRequests: [],
    };
    const teamRef = await addDoc(collection(db, `colleges/${collegeId}/teams`), newTeam);

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
        throw new Error("You are already in a team for this event.");
    }
    
    const q = query(collection(db, `colleges/${collegeId}/teams`), where("hackathonId", "==", hackathonId), where("joinCode", "==", joinCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error("Invalid join code for this event.");
    }

    const teamDoc = querySnapshot.docs[0];
    return requestToJoinTeamById(collegeId, hackathonId, teamDoc.id, user);
}

export async function requestToJoinTeamById(collegeId: string, hackathonId: string, teamId: string, user: User) {
    const userTeamsQuery = query(
        collection(db, `colleges/${collegeId}/teams`), 
        where("hackathonId", "==", hackathonId),
        where('members', 'array-contains', {id: user.id, name: user.name, email: user.email})
    );

    const userTeamsSnapshot = await getDocs(userTeamsQuery);
    if (!userTeamsSnapshot.empty) {
        throw new Error("You are already in a team for this event.");
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

    if (action === 'accept') {
        const userDoc = await getDoc(doc(db, `colleges/${collegeId}/users`, request.id));
        if(!userDoc.exists()) throw new Error("User trying to join does not exist.");
        
        const userData = userDoc.data() as User;
        const newMember: TeamMember = { ...userData, role: 'Member' };

        await updateDoc(teamRef, {
            members: arrayUnion(newMember),
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

export async function addTeammate(collegeId: string, teamId: string, user: User) {
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);
    const newMember: TeamMember = { ...user, role: 'Member' };
    await updateDoc(teamRef, {
        members: arrayUnion(newMember)
    });
    return { successMessage: `${user.name} has been added to the team.` };
}

export async function removeTeammate(collegeId: string, teamId: string, memberToRemove: TeamMember) {
    const teamRef = doc(db, `colleges/${collegeId}/teams`, teamId);

    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) throw new Error("Team not found");
    const team = teamDoc.data() as Team;

    const memberObject = team.members.find(m => m.id === memberToRemove.id);
    if (!memberObject) throw new Error("Member not found in team");

    await updateDoc(teamRef, {
        members: arrayRemove(memberObject)
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
    
    return { successMessage: "You have left the team." };
}

export async function submitProject(collegeId: string, hackathonId: string, teamId: string, idea: ProjectIdea, submissionId?: string) {
    let processedIdea = { ...idea };
    if (idea.abstractFile) {
        const fileRef = ref(storage, `colleges/${collegeId}/abstracts/${teamId}/${idea.id}-${idea.abstractFile.name}`);
        const snapshot = await uploadBytes(fileRef, idea.abstractFile);
        processedIdea.abstractFileUrl = await getDownloadURL(snapshot.ref);
    }
    const { abstractFile, ...ideaToSave } = processedIdea;

    if (submissionId) {
        // This is an additional idea for an existing submission
        const submissionRef = doc(db, `colleges/${collegeId}/projects`, submissionId);
        const submissionDoc = await getDoc(submissionRef);
        if (submissionDoc.exists() && submissionDoc.data().projectIdeas.length < 3) {
            await updateDoc(submissionRef, {
                projectIdeas: arrayUnion(ideaToSave)
            });
        } else {
            throw new Error("Cannot add more than 3 ideas.");
        }
    } else {
        // This is the first idea, create a new submission
        const newSubmission: Omit<ProjectSubmission, 'id'> = {
            teamId,
            hackathonId,
            projectIdeas: [ideaToSave],
            scores: [],
            averageScore: 0,
            submittedAt: Date.now(),
            status: 'PendingGuide',
        };
        const submissionRef = await addDoc(collection(db, `colleges/${collegeId}/projects`), newSubmission);
        await updateDoc(doc(db, `colleges/${collegeId}/teams`, teamId), { submissionId: submissionRef.id });

        // Asynchronously generate project image and don't block the return
        generateProjectImage({ projectName: ideaToSave.title, projectDescription: ideaToSave.description })
            .then(async (result) => {
                if (result && result.imageUrl) {
                    await updateDoc(submissionRef, { imageUrl: result.imageUrl });
                }
            })
            .catch(error => {
                console.error("Background project image generation failed:", error);
            });
    }
    
    return { successMessage: "Project idea submitted successfully!" };
}


export async function updateProfile(collegeId: string, userId: string, profileData: Partial<UserProfileData>) {
    await updateDoc(doc(db, `colleges/${collegeId}/users`, userId), profileData);
    return { successMessage: "Profile updated successfully." };
}

export async function postTeamMessage(collegeId: string, teamId: string, message: Omit<ChatMessage, 'id'>) {
    const newMessage = { ...message, id: doc(collection(db, 'dummy')).id };
    await updateDoc(doc(db, `colleges/${collegeId}/teams`, teamId), {
        messages: arrayUnion(newMessage)
    });
    return { successMessage: "Message sent." };
}

export async function saveGuidanceHistory(collegeId: string, userOrFacultyId: string, history: ChatMessage[], role: 'user' | 'faculty') {
    const collectionName = role === 'user' ? 'users' : 'faculty';
    const userRef = doc(db, `colleges/${collegeId}/${collectionName}`, userOrFacultyId);
    await updateDoc(userRef, { guidanceHistory: history });
    return { successMessage: "History saved." };
}

export async function clearGuidanceHistory(collegeId: string, userOrFacultyId: string, role: 'user' | 'faculty') {
    const collectionName = role === 'user' ? 'users' : 'faculty';
    const userRef = doc(db, `colleges/${collegeId}/${collectionName}`, userOrFacultyId);
    await updateDoc(userRef, { guidanceHistory: [] });
    return { successMessage: "Chat history cleared." };
}


// --- Faculty ---
export async function evaluateProject(collegeId: string, projectId: string, evaluatorId: string, scores: Score[]) {
    const projectRef = doc(db, `colleges/${collegeId}/projects`, projectId);
    const projectDoc = await getDoc(projectRef);
    if(!projectDoc.exists()) throw new Error("Project not found.");
    const project = projectDoc.data() as ProjectSubmission;

    const otherEvaluatorsScores = project.scores.filter(s => s.evaluatorId !== evaluatorId);
    const newScores = [...otherEvaluatorsScores, ...scores];

    const teamScores = newScores.filter(s => !s.memberId);
    
    const uniqueEvaluators = new Set(teamScores.map(s => s.evaluatorId));
    let totalScore = 0;
    
    uniqueEvaluators.forEach(id => {
        const evaluatorScores = teamScores.filter(s => s.evaluatorId === id);
        const rubricMax = EVALUATION_RUBRIC.reduce((sum, c) => sum + c.max, 0);
        const evaluatorTotal = evaluatorScores.reduce((sum, score) => sum + score.value, 0);
        const scoredCriteriaIds = new Set(evaluatorScores.map(s => s.criteria));
        const scoredRubricMax = EVALUATION_RUBRIC.filter(c => scoredCriteriaIds.has(c.id)).reduce((sum, c) => sum + c.max, 0);
        
        if (scoredRubricMax > 0) {
            const scaledEvaluatorTotal = (evaluatorTotal / scoredRubricMax) * 10;
            totalScore += scaledEvaluatorTotal;
        }
    });

    const averageScore = uniqueEvaluators.size > 0 ? (totalScore / uniqueEvaluators.size) : 0;
    
    await updateDoc(projectRef, { 
        scores: newScores, 
        averageScore: averageScore,
    });
    return { successMessage: "Evaluation submitted successfully." };
}

// --- Support ---
export async function submitSupportTicket(collegeId: string, ticketData: Omit<SupportTicket, 'id' | 'submittedAt' | 'status' | 'category' | 'priority' | 'suggestedResponse'>) {
    
    const triageResult = await triageSupportTicket({
        subject: ticketData.subject,
        question: ticketData.description,
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

export async function sendSupportResponse(collegeId: string, ticketId: string, responder: User | Faculty, message: string) {
    const ticketRef = doc(db, `colleges/${collegeId}/supportTickets`, ticketId);
    const ticketDoc = await getDoc(ticketRef);
if (!ticketDoc.exists()) throw new Error("Ticket not found.");
    const ticket = ticketDoc.data() as SupportTicket;
    
    const response: SupportResponse = {
        id: doc(collection(db, 'dummy')).id,
        responderId: responder.id,
        responderName: responder.name,
        message,
        timestamp: Date.now(),
    };

    await updateDoc(ticketRef, {
        responses: arrayUnion(response),
        status: 'In Progress'
    });

    const studentRef = doc(db, `colleges/${collegeId}/users`, ticket.studentId);
    const notification = {
        id: doc(collection(db, 'dummy')).id,
        message: `Faculty member ${responder.name.split(' ')[0]} replied to your ticket: "${ticket.subject}"`,
        link: `/support/tickets/${ticketId}`,
        timestamp: Date.now(),
        isRead: false,
    };
    await updateDoc(studentRef, {
        notifications: arrayUnion(notification)
    });

    return { successMessage: "Response sent to student." };
}

export async function markNotificationsAsRead(collegeId: string, userId: string, notificationIds: string[], role: 'user' | 'faculty') {
    const collectionName = role === 'user' ? 'users' : 'faculty';
    const userRef = doc(db, `colleges/${collegeId}/${collectionName}`, userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User not found");

    const user = userDoc.data() as User | Faculty;
    const updatedNotifications = (user.notifications || []).map(n => 
        notificationIds.includes(n.id) ? { ...n, isRead: true } : n
    );

    await updateDoc(userRef, { notifications: updatedNotifications });
    return { successMessage: "Notifications marked as read." };
}

// --- Data Management (Admin) ---

export async function createHackathon(collegeId: string, data: Omit<Hackathon, 'id'>) {
    await addDoc(collection(db, `colleges/${collegeId}/hackathons`), data);
    return { successMessage: "Project Event created successfully." };
}

export async function updateHackathon(collegeId: string, hackathonId: string, data: Partial<Hackathon>) {
    await updateDoc(doc(db, `colleges/${collegeId}/hackathons`, hackathonId), data);
    return { successMessage: "Project Event updated successfully." };
}

export async function resetCurrentHackathon(collegeId: string, hackathonId: string) {
    const batch = writeBatch(db);

    const teamsQuery = query(collection(db, `colleges/${collegeId}/teams`), where('hackathonId', '==', hackathonId));
    const teamsSnapshot = await getDocs(teamsQuery);
    teamsSnapshot.forEach(doc => batch.delete(doc.ref));

    const projectsQuery = query(collection(db, `colleges/${collegeId}/projects`), where('hackathonId', '==', hackathonId));
    const projectsSnapshot = await getDocs(projectsQuery);
    projectsSnapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    return { successMessage: "All teams and projects for the current event have been deleted." };
}

export async function resetAllHackathons(collegeId: string) {
    const batch = writeBatch(db);
    const collectionsToDelete = ['hackathons', 'teams', 'projects'];

    for (const col of collectionsToDelete) {
        const querySnapshot = await getDocs(collection(db, `colleges/${collegeId}/${col}`));
        querySnapshot.forEach(doc => batch.delete(doc.ref));
    }

    await batch.commit();
    return { successMessage: "All events, teams, and projects have been deleted." };
}


export async function resetAllUsers(collegeId: string) {
    const batch = writeBatch(db);
    const usersQuery = query(collection(db, `colleges/${collegeId}/users`));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
        return { successMessage: "No users to reset." };
    }

    usersSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    
    return { successMessage: "All user records have been deleted from the database. Auth accounts may still exist and need to be manually removed from the Firebase console." };
}
