
"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, Team, Project, Judge, Score, UserProfileData, HackathonData, Announcement } from '../lib/types';
import { JUDGING_RUBRIC } from '../lib/constants';
import { useToast } from '@/hooks/use-toast';

// --- Helper Functions for localStorage ---
const getInitialState = (): HackathonState => {
    if (typeof window === 'undefined') {
        return defaultState;
    }
    try {
        const serializedState = localStorage.getItem('hackathonState');
        if (serializedState === null) {
            return defaultState;
        }
        const storedState = JSON.parse(serializedState);
        // Ensure all default keys are present
        return { ...defaultState, ...storedState, isInitialized: true, isLoading: false };
    } catch (error) {
        console.error("Could not load state from localStorage", error);
        return defaultState;
    }
};

const saveState = (state: HackathonState) => {
    try {
        const stateToSave = { ...state, isInitialized: true, isLoading: false };
        const serializedState = JSON.stringify(stateToSave);
        localStorage.setItem('hackathonState', serializedState);
    } catch (error) {
        console.error("Could not save state to localStorage", error);
    }
};


interface HackathonState {
  users: User[];
  teams: Team[];
  projects: Project[];
  judges: Judge[];
  announcements: Announcement[];
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
  | { type: 'SCORE_PROJECT'; payload: { projectId: string; judgeId: string; scores: Score[] } }
  | { type: 'UPDATE_PROFILE'; payload: { userId: string, profileData: Partial<UserProfileData> } }
  | { type: 'POST_ANNOUNCEMENT'; payload: string }
  | { type: 'RESET_HACKATHON' }
  | { type: 'RESET_JUDGES' }
  | { type: 'SELECT_COLLEGE'; payload: string };


const defaultState: HackathonState = {
  users: [],
  teams: [],
  projects: [],
  judges: [],
  announcements: [],
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
    case 'HYDRATE_STATE':
        return { ...state, ...action.payload, isInitialized: true, isLoading: false };

    case 'CLEAR_MESSAGES':
        return { ...state, authError: null, successMessage: null };
    
    case 'SELECT_COLLEGE':
        return { ...state, selectedCollege: action.payload, successMessage: `Welcome, ${action.payload}!` };

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
        if (state.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
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
        return { ...state, users: [...state.users, newUser], successMessage: "Registration successful! Your account is pending admin approval." };
    }
     case 'ADMIN_REGISTER_STUDENT': {
        const { name, email, password } = action.payload;
        if (state.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
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
        return { ...state, users: [...state.users, newUser], successMessage: `${name} has been registered and approved.` };
    }
    case 'APPROVE_STUDENT': {
        return {
            ...state,
            users: state.users.map(u => u.id === action.payload.userId ? { ...u, status: 'approved' } : u),
            successMessage: "Student approved successfully."
        };
    }
    case 'CREATE_TEAM': {
        const { teamName, userId } = action.payload;
        const newTeam: Team = {
            id: `team-${Date.now()}`,
            name: teamName,
            joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            members: [state.users.find(u => u.id === userId)!],
            projectId: ""
        };
        return {
            ...state,
            teams: [...state.teams, newTeam],
            users: state.users.map(u => u.id === userId ? { ...u, teamId: newTeam.id } : u),
            currentUser: { ...state.currentUser!, teamId: newTeam.id },
            successMessage: "Team created successfully!"
        };
    }

    case 'JOIN_TEAM': {
        const { joinCode, userId } = action.payload;
        const teamToJoin = state.teams.find(t => t.joinCode === joinCode);
        if (!teamToJoin) {
            return { ...state, authError: "Invalid join code." };
        }
        if ((teamToJoin.members as User[]).some(m => m.id === userId)) {
             return { ...state, authError: "You are already in this team." };
        }
        return {
            ...state,
            teams: state.teams.map(t => t.id === teamToJoin.id ? { ...t, members: [...t.members, state.users.find(u => u.id === userId)!] } : t),
            users: state.users.map(u => u.id === userId ? { ...u, teamId: teamToJoin.id } : u),
            currentUser: { ...state.currentUser!, teamId: teamToJoin.id },
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
        return {
            ...state,
            projects: [...state.projects, newProject],
            teams: state.teams.map(t => t.id === teamId ? { ...t, projectId: newProject.id } : t),
            successMessage: "Project submitted successfully!"
        };
    }

    case 'ADD_JUDGE': {
        const { name, email, password } = action.payload;
        if (!email.toLowerCase().endsWith('@judge.com')) {
            return { ...state, authError: 'Judge email must end with @judge.com' };
        }
        if (state.judges.find(j => j.email.toLowerCase() === email.toLowerCase())) {
            return { ...state, authError: 'A judge with this email already exists.' };
        }
        const newJudge: Judge = {
            id: `judge-${Date.now()}`,
            name, email, password
        };
        return { ...state, judges: [...state.judges, newJudge], successMessage: "Judge added successfully!" };
    }
    
    case 'SCORE_PROJECT': {
        const { projectId, judgeId, scores } = action.payload;
        const projects = state.projects.map(p => {
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
        return { ...state, projects, successMessage: "Scores submitted successfully." };
    }

    case 'UPDATE_PROFILE': {
        const { userId, profileData } = action.payload;
        const updatedUsers = state.users.map(u => u.id === userId ? { ...u, ...profileData } : u);
        const updatedCurrentUser = state.currentUser?.id === userId ? { ...state.currentUser, ...profileData } : state.currentUser;
        
        return {
            ...state,
            users: updatedUsers,
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
      return {
        ...state,
        announcements: [...state.announcements, newAnnouncement],
        successMessage: 'Announcement posted successfully.',
      };
    }

    case 'RESET_HACKATHON': {
        return {
            ...defaultState,
            selectedCollege: state.selectedCollege, // Keep the selected college
            isInitialized: true,
            isLoading: false,
            successMessage: "All hackathon data has been reset."
        };
    }

    case 'RESET_JUDGES': {
         return {
            ...state,
            judges: [],
            projects: state.projects.map(p => ({ ...p, scores: [], averageScore: 0})),
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
  const [state, dispatch] = useReducer(hackathonReducer, defaultState, getInitialState);
  const { toast } = useToast();

   useEffect(() => {
    if (state.isInitialized) {
      saveState(state);
    }
  }, [state]);
  
  useEffect(() => {
    dispatch({ type: 'HYDRATE_STATE', payload: getInitialState() });
  }, []);

  useEffect(() => {
    // This effect handles showing toast notifications for success/error messages
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
