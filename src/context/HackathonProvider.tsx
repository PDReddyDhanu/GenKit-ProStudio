
"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { User, Team, Project, Judge, Score, UserProfileData, Announcement, HackathonData } from '../lib/types';
import { JUDGING_RUBRIC } from '../lib/constants';
import { useToast } from '@/hooks/use-toast';

// --- Helper Functions for localStorage ---
const getInitialState = (): HackathonState => {
    if (typeof window === 'undefined') {
        return defaultState;
    }
    try {
        const serializedState = localStorage.getItem('hackathonGlobalState');
        const storedState = serializedState ? JSON.parse(serializedState) : {};

        const selectedCollege = storedState.selectedCollege || null;
        let collegeData: HackathonData = defaultCollegeData;

        if (selectedCollege) {
            const serializedCollegeState = localStorage.getItem(`hackathonState_${selectedCollege}`);
            if (serializedCollegeState) {
                collegeData = JSON.parse(serializedCollegeState);
            }
        }
        
        return { 
            ...defaultState, 
            ...storedState, 
            collegeData,
            isInitialized: true, 
            isLoading: false,
        };
    } catch (error) {
        console.error("Could not load state from localStorage", error);
        return { ...defaultState, isInitialized: true, isLoading: false };
    }
};

const saveState = (state: HackathonState) => {
    try {
        // Save only non-sensitive global state
        const globalStateToSave = {
            currentAdmin: state.currentAdmin,
            selectedCollege: state.selectedCollege,
            // Persist a reference to the logged-in user, not the full object
            currentUser: state.currentUser ? { id: state.currentUser.id } : null,
            currentJudge: state.currentJudge ? { id: state.currentJudge.id } : null,
        };

        const serializedGlobalState = JSON.stringify(globalStateToSave);
        localStorage.setItem('hackathonGlobalState', serializedGlobalState);

        // Save the data for the selected college
        if (state.selectedCollege) {
            const serializedCollegeState = JSON.stringify(state.collegeData);
            localStorage.setItem(`hackathonState_${state.selectedCollege}`, serializedCollegeState);
        }

    } catch (error) {
        console.error("Could not save state to localStorage", error);
    }
};

const defaultCollegeData: HackathonData = {
    users: [],
    teams: [],
    projects: [],
    judges: [],
    announcements: [],
};

interface HackathonState {
  collegeData: HackathonData;
  currentUser: User | null;
  currentJudge: Judge | null;
  currentAdmin: boolean;
  selectedCollege: string | null;
  authError: string | null;
  successMessage: string | null;
  isInitialized: boolean;
  isLoading: boolean;
}

type Action =
  | { type: 'HYDRATE_STATE'; payload: Partial<HackathonState> }
  | { type: 'LOGIN_STUDENT'; payload: User }
  | { type: 'LOGIN_JUDGE'; payload: Judge }
  | { type: 'ADMIN_LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH_ERROR'; payload: string }
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'REGISTER_STUDENT'; payload: { name: string; email: string; password: string } }
  | { type: 'CREATE_TEAM'; payload: { teamName: string; userId: string } }
  | { type: 'JOIN_TEAM'; payload: { joinCode: string; userId: string } }
  | { type: 'SUBMIT_PROJECT'; payload: { name: string; description: string; githubUrl: string, teamId: string } }
  | { type: 'ADD_JUDGE'; payload: { name: string; email: string; password: string } }
  | { type: 'APPROVE_STUDENT'; payload: { userId: string } }
  | { type: 'ADMIN_REGISTER_STUDENT'; payload: { name: string; email: string; password: string } }
  | { type: 'REMOVE_STUDENT'; payload: { userId: string } }
  | { type: 'SCORE_PROJECT'; payload: { projectId: string; judgeId: string; scores: Score[] } }
  | { type: 'UPDATE_PROFILE'; payload: { userId: string, profileData: Partial<UserProfileData> } }
  | { type: 'POST_ANNOUNCEMENT'; payload: string }
  | { type: 'RESET_HACKATHON' }
  | { type: 'RESET_JUDGES' }
  | { type: 'SELECT_COLLEGE'; payload: string };


const defaultState: HackathonState = {
  collegeData: defaultCollegeData,
  currentUser: null,
  currentJudge: null,
  currentAdmin: false,
  selectedCollege: null,
  authError: null,
  successMessage: null,
  isInitialized: false,
  isLoading: true,
};

function hackathonReducer(state: HackathonState, action: Action): HackathonState {
  const baseState = { ...state, authError: null, successMessage: null };

  switch (action.type) {
    case 'HYDRATE_STATE': {
        const { selectedCollege } = action.payload;
        let collegeData = defaultCollegeData;
        let currentUser: User | null = null;
        let currentJudge: Judge | null = null;

        if (selectedCollege) {
            const serializedCollegeState = localStorage.getItem(`hackathonState_${selectedCollege}`);
            collegeData = serializedCollegeState ? JSON.parse(serializedCollegeState) : defaultCollegeData;
        }
        
        // Re-hydrate the current user/judge object from the newly loaded collegeData
        const storedUserRef = action.payload.currentUser as { id: string } | null;
        if (storedUserRef) {
            currentUser = collegeData.users?.find(u => u.id === storedUserRef.id) || null;
        }

        const storedJudgeRef = action.payload.currentJudge as { id: string } | null;
        if (storedJudgeRef) {
            currentJudge = collegeData.judges?.find(j => j.id === storedJudgeRef.id) || null;
        }
        
        return { 
            ...state, 
            ...action.payload, 
            collegeData,
            currentUser,
            currentJudge,
            isInitialized: true, 
            isLoading: false 
        };
    }

    case 'CLEAR_MESSAGES':
        return { ...state, authError: null, successMessage: null };
    
    case 'SELECT_COLLEGE': {
        if (typeof window === 'undefined') return state;
        
        const serializedCollegeState = localStorage.getItem(`hackathonState_${action.payload}`);
        const collegeData = serializedCollegeState ? JSON.parse(serializedCollegeState) : defaultCollegeData;

        return { 
            ...defaultState, // Reset most of the state
            isInitialized: true,
            isLoading: false,
            selectedCollege: action.payload,
            collegeData: collegeData,
            successMessage: action.payload ? `Welcome to ${action.payload}!` : null
        };
    }

    case 'LOGIN_STUDENT':
        return { ...baseState, currentUser: action.payload, currentJudge: null, currentAdmin: false, successMessage: 'Login successful!' };
    
    case 'LOGIN_JUDGE':
        return { ...baseState, currentJudge: action.payload, currentUser: null, currentAdmin: false, successMessage: 'Login successful!' };

    case 'ADMIN_LOGIN':
        return { ...baseState, currentAdmin: true, currentUser: null, currentJudge: null, successMessage: 'Admin login successful!' };

    case 'SET_AUTH_ERROR':
        return { ...state, authError: action.payload };

    case 'SET_SUCCESS_MESSAGE':
        return { ...state, successMessage: action.payload };
    
    case 'LOGOUT': {
      return {
            ...state,
            currentUser: null,
            currentJudge: null,
            currentAdmin: false,
            successMessage: "You have been logged out."
        }
    }
    case 'REGISTER_STUDENT': {
        const { name, email, password } = action.payload;
        if (state.collegeData.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { ...state, authError: "A user with this email already exists." };
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
            name, email: email.toLowerCase(), password,
            status: 'pending',
            skills: [],
            bio: '',
            github: '',
            linkedin: ''
        };
        const newCollegeData = { ...state.collegeData, users: [...state.collegeData.users, newUser] };
        return { ...state, collegeData: newCollegeData, successMessage: "Registration successful! Your account is pending admin approval." };
    }
     case 'ADMIN_REGISTER_STUDENT': {
        const { name, email, password } = action.payload;
        if (state.collegeData.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { ...state, authError: "A user with this email already exists." };
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
            name, email, password,
            status: 'approved', // Directly approved
            skills: [],
            bio: '',
            github: '',
            linkedin: ''
        };
        const newCollegeData = { ...state.collegeData, users: [...state.collegeData.users, newUser] };
        return { ...state, collegeData: newCollegeData, successMessage: `${name} has been registered and approved.` };
    }
    case 'APPROVE_STUDENT': {
        const newUsers = state.collegeData.users.map(u => u.id === action.payload.userId ? { ...u, status: 'approved' } : u)
        return {
            ...state,
            collegeData: { ...state.collegeData, users: newUsers },
            successMessage: "Student approved successfully."
        };
    }
    case 'REMOVE_STUDENT': {
        const { userId } = action.payload;
        const studentToRemove = state.collegeData.users.find(u => u.id === userId);
        if (!studentToRemove) return state;

        // Filter out the student
        const newUsers = state.collegeData.users.filter(u => u.id !== userId);

        // If the student was in a team, remove them from the team
        const newTeams = state.collegeData.teams.map(team => {
            if (team.id === studentToRemove.teamId) {
                const updatedMembers = (team.members as User[]).filter(member => member.id !== userId);
                return { ...team, members: updatedMembers };
            }
            return team;
        });

        return {
            ...state,
            collegeData: { ...state.collegeData, users: newUsers, teams: newTeams },
            successMessage: `Student ${studentToRemove.name} has been removed.`
        };
    }
    case 'CREATE_TEAM': {
        const { teamName, userId } = action.payload;
        if (!state.currentUser) return state;

        const newTeam: Team = {
            id: `team-${Date.now()}`,
            name: teamName,
            joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            members: [state.currentUser],
            projectId: ""
        };
        
        const newTeams = [...state.collegeData.teams, newTeam];
        const newUsers = state.collegeData.users.map(u => u.id === userId ? { ...u, teamId: newTeam.id } : u);

        return {
            ...state,
            collegeData: { ...state.collegeData, teams: newTeams, users: newUsers },
            currentUser: { ...state.currentUser, teamId: newTeam.id },
            successMessage: "Team created successfully!"
        };
    }

    case 'JOIN_TEAM': {
        const { joinCode, userId } = action.payload;
        if(!state.currentUser) return state;

        const teamToJoin = state.collegeData.teams.find(t => t.joinCode === joinCode);
        if (!teamToJoin) {
            return { ...state, authError: "Invalid join code." };
        }
        if ((teamToJoin.members as User[]).some(m => m.id === userId)) {
             return { ...state, authError: "You are already in this team." };
        }
        
        const newTeams = state.collegeData.teams.map(t => t.id === teamToJoin.id ? { ...t, members: [...t.members, state.currentUser!] } : t);
        const newUsers = state.collegeData.users.map(u => u.id === userId ? { ...u, teamId: teamToJoin.id } : u);

        return {
            ...state,
            collegeData: { ...state.collegeData, teams: newTeams, users: newUsers },
            currentUser: { ...state.currentUser, teamId: teamToJoin.id },
            successMessage: `Successfully joined team: ${teamToJoin.name}`
        };
    }

    case 'SUBMIT_PROJECT': {
        const { name, description, githubUrl, teamId } = action.payload;
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            teamId, name, description, githubUrl,
            scores: [],
            averageScore: 0
        };
        const newProjects = [...state.collegeData.projects, newProject];
        const newTeams = state.collegeData.teams.map(t => t.id === teamId ? { ...t, projectId: newProject.id } : t);

        return {
            ...state,
            collegeData: { ...state.collegeData, projects: newProjects, teams: newTeams },
            successMessage: "Project submitted successfully!"
        };
    }

    case 'ADD_JUDGE': {
        const { name, email, password } = action.payload;
        if (!email.toLowerCase().endsWith('@judge.com')) {
            return { ...state, authError: 'Judge email must end with @judge.com' };
        }
        if (state.collegeData.judges.find(j => j.email.toLowerCase() === email.toLowerCase())) {
            return { ...state, authError: 'A judge with this email already exists.' };
        }
        const newJudge: Judge = {
            id: `judge-${Date.now()}`,
            name, email, password
        };
        const newJudges = [...state.collegeData.judges, newJudge];
        return { ...state, collegeData: { ...state.collegeData, judges: newJudges }, successMessage: "Judge added successfully!" };
    }
    
    case 'SCORE_PROJECT': {
        const { projectId, judgeId, scores } = action.payload;
        const newProjects = state.collegeData.projects.map(p => {
            if (p.id === projectId) {
                const otherScores = p.scores.filter(s => s.judgeId !== judgeId);
                const newScores = [...otherScores, ...scores];
                
                const uniqueJudges = new Set(newScores.map(s => s.judgeId));
                const totalPossibleScore = uniqueJudges.size * JUDGING_RUBRIC.reduce((sum, c) => sum + c.max, 0);
                const totalScore = newScores.reduce((sum, score) => sum + score.value, 0);
                const averageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 10 : 0;
                
                return { ...p, scores: newScores, averageScore };
            }
            return p;
        });
        return { ...state, collegeData: { ...state.collegeData, projects: newProjects }, successMessage: "Scores submitted successfully." };
    }

    case 'UPDATE_PROFILE': {
        const { userId, profileData } = action.payload;
        const updatedUsers = state.collegeData.users.map(u => u.id === userId ? { ...u, ...profileData } : u);
        const updatedCurrentUser = state.currentUser?.id === userId ? { ...state.currentUser, ...profileData } : state.currentUser;
        
        return {
            ...state,
            collegeData: { ...state.collegeData, users: updatedUsers },
            currentUser: updatedCurrentUser,
            successMessage: "Profile updated successfully."
        };
    }

    case 'POST_ANNOUNCEMENT': {
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        message: action.payload,
        timestamp: Date.now(),
      };
      const newAnnouncements = [...state.collegeData.announcements, newAnnouncement];
      return {
        ...state,
        collegeData: { ...state.collegeData, announcements: newAnnouncements },
        successMessage: 'Announcement posted successfully.',
      };
    }

    case 'RESET_HACKATHON': {
        return {
            ...state,
            collegeData: defaultCollegeData,
            successMessage: "All hackathon data for this college has been reset."
        };
    }

    case 'RESET_JUDGES': {
         return {
            ...state,
            collegeData: {
                ...state.collegeData,
                judges: [],
                projects: state.collegeData.projects.map(p => ({ ...p, scores: [], averageScore: 0})),
            },
            successMessage: "All judges and their scores have been reset."
        };
    }

    default:
      return state;
  }
}

const HackathonContext = createContext<{
  state: HackathonState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const HackathonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(hackathonReducer, defaultState);
  const { toast } = useToast();

   useEffect(() => {
    if (state.isInitialized) {
      saveState(state);
    }
  }, [state]);
  
  useEffect(() => {
    const initialState = getInitialState();
    dispatch({ type: 'HYDRATE_STATE', payload: initialState });
  }, []);

  useEffect(() => {
    if (state.successMessage) {
        toast({ title: 'Success', description: state.successMessage });
        dispatch({ type: 'CLEAR_MESSAGES' });
    }
    if (state.authError) {
        toast({ title: 'Error', description: state.authError, variant: 'destructive' });
        dispatch({ type: 'CLEAR_MESSAGES' });
    }
  }, [state.successMessage, state.authError, toast]);


  return (
    <HackathonContext.Provider value={{ state, dispatch }}>
      {children}
    </HackathonContext.Provider>
  );
};

export const useHackathon = () => {
  const context = useContext(HackathonContext);
  if (!context) {
    throw new Error('useHackathon must be used within a HackathonProvider');
  }
  return context;
};
