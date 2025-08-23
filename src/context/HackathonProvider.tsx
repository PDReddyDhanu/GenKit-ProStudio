"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, Team, Project, Judge, Score, UserProfileData, HackathonData } from '../lib/types';
import { JUDGING_RUBRIC } from '../lib/constants';
import * as actions from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface HackathonState {
  users: User[];
  teams: Team[];
  projects: Project[];
  judges: Judge[];
  currentUser: User | null;
  currentJudge: Judge | null;
  currentAdmin: boolean;
  authError: string | null;
  successMessage: string | null;
  isInitialized: boolean;
  isLoading: boolean;
}

type Action =
  | { type: 'HYDRATE_STATE'; payload: Partial<HackathonState> }
  | { type: 'SET_INITIAL_DATA'; payload: HackathonData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_STUDENT'; payload: User }
  | { type: 'LOGIN_JUDGE'; payload: Judge }
  | { type: 'ADMIN_LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH_ERROR'; payload: string }
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' };

const defaultState: HackathonState = {
  users: [],
  teams: [],
  projects: [],
  judges: [],
  currentUser: null,
  currentJudge: null,
  currentAdmin: false,
  authError: null,
  successMessage: null,
  isInitialized: false,
  isLoading: true,
};

function hackathonReducer(state: HackathonState, action: Action): HackathonState {
  const baseState = { ...state, authError: null, successMessage: null };

  switch (action.type) {
    case 'HYDRATE_STATE':
        return { ...state, ...action.payload, isInitialized: true };

    case 'SET_INITIAL_DATA': {
        const { users, teams, projects, judges } = action.payload;

        const augmentedProjects = projects.map(project => {
            const projectScores = project.scores || [];
            const uniqueJudges = new Set(projectScores.map(s => s.judgeId));
            const totalPossibleScore = uniqueJudges.size * JUDGING_RUBRIC.reduce((sum, c) => sum + c.max, 0);
            const totalScore = projectScores.reduce((sum, score) => sum + score.value, 0);
            const averageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 10 : 0;
            return { ...project, averageScore };
        });
        
        // Augment teams with full member objects
        const augmentedTeams = teams.map(team => ({
            ...team,
            members: team.members.map(memberId => users.find(u => u.id === memberId)).filter(Boolean) as User[]
        }));

        return { ...state, users, teams: augmentedTeams, projects: augmentedProjects, judges, isLoading: false };
    }
    
    case 'SET_LOADING':
        return { ...state, isLoading: action.payload };

    case 'CLEAR_MESSAGES':
        return { ...state, authError: null, successMessage: null };

    case 'LOGIN_STUDENT':
        return { ...baseState, currentUser: action.payload, currentJudge: null, currentAdmin: false, successMessage: 'Login successful!' };
    
    case 'LOGIN_JUDGE':
        return { ...baseState, currentJudge: action.payload, currentUser: null, currentAdmin: false, successMessage: 'Login successful!' };

    case 'ADMIN_LOGIN':
        return { ...baseState, currentAdmin: true, currentUser: null, currentJudge: null, successMessage: 'Admin login successful!' };

    case 'SET_AUTH_Error':
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
    default:
      return state;
  }
}

const HackathonContext = createContext<{
  state: HackathonState;
  dispatch: React.Dispatch<Action>;
  refreshData: () => Promise<void>;
} | undefined>(undefined);

export const HackathonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(hackathonReducer, defaultState);
  const { toast } = useToast();

  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
        const data = await actions.getHackathonData();
        dispatch({ type: 'SET_INITIAL_DATA', payload: data });
    } catch (error) {
        console.error("Failed to fetch latest data", error);
        dispatch({ type: 'SET_AUTH_ERROR', payload: "Could not connect to the database."})
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    // This effect runs once on mount to get the initial data.
    refreshData();
  }, [refreshData]);

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
    <HackathonContext.Provider value={{ state, dispatch, refreshData }}>
      {state.isLoading ? <div className="h-screen w-full flex items-center justify-center bg-background"><p>Loading HackSprint...</p></div> : children}
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
