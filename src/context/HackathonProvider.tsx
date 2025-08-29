
"use client";

import React, { createContext, useContext, ReactNode, useEffect, useReducer } from 'react';
import { User, Team, Project, Judge, Announcement, Hackathon } from '../lib/types';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import * as hackathonApi from '@/lib/hackathon-api';

interface HackathonState {
  users: User[];
  teams: Team[];
  projects: Project[];
  judges: Judge[];
  announcements: Announcement[];
  hackathons: Hackathon[];
  currentUser: User | null;
  currentJudge: Judge | null;
  currentAdmin: boolean;
  selectedCollege: string | null;
  selectedHackathonId: string | null; // New state for selected hackathon
  authError: string | null;
  successMessage: string | null;
  isInitialized: boolean;
  isLoading: boolean;
}

const defaultState: HackathonState = {
  users: [],
  teams: [],
  projects: [],
  judges: [],
  announcements: [],
  hackathons: [],
  currentUser: null,
  currentJudge: null,
  currentAdmin: false,
  selectedCollege: null,
  selectedHackathonId: null,
  authError: null,
  successMessage: null,
  isInitialized: false,
  isLoading: true,
};

type Action =
  | { type: 'SET_DATA'; payload: { [key: string]: any[] } }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_JUDGE'; payload: Judge | null }
  | { type: 'SET_ADMIN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_SELECTED_COLLEGE'; payload: string | null }
  | { type: 'SET_SELECTED_HACKATHON'; payload: string | null }
  | { type: 'SET_AUTH_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SIGN_OUT_USER' };

function hackathonReducer(state: HackathonState, action: Action): HackathonState {
    switch (action.type) {
        case 'SET_DATA':
            return { ...state, ...action.payload };
        case 'SET_USER':
            const user = action.payload;
            const hackathonId = user ? user.hackathonId : null;
            return { ...state, currentUser: user, currentJudge: null, currentAdmin: false, isLoading: false, selectedHackathonId: hackathonId || state.selectedHackathonId };
        case 'SET_JUDGE':
            return { ...state, currentJudge: action.payload, currentUser: null, currentAdmin: false, isLoading: false };
        case 'SET_ADMIN':
            return { ...state, currentAdmin: action.payload, currentUser: null, currentJudge: null, isLoading: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_INITIALIZED':
            return { ...state, isInitialized: action.payload };
        case 'SET_SELECTED_COLLEGE':
            const college = action.payload;
            if (college && state.selectedCollege !== college) {
                 return {
                    ...defaultState,
                    selectedCollege: college,
                    isInitialized: state.isInitialized,
                    successMessage: `Welcome to ${college}!`,
                };
            }
            return { ...state, selectedCollege: college, isLoading: !!college };
        case 'SET_SELECTED_HACKATHON':
             if (action.payload) {
                localStorage.setItem(`selectedHackathon_${state.selectedCollege}`, action.payload);
            } else {
                localStorage.removeItem(`selectedHackathon_${state.selectedCollege}`);
            }
            return { ...state, selectedHackathonId: action.payload };
        case 'SET_AUTH_ERROR':
            return { ...state, authError: action.payload };
        case 'SET_SUCCESS_MESSAGE':
            return { ...state, successMessage: action.payload };
        case 'CLEAR_MESSAGES':
            return { ...state, authError: null, successMessage: null };
        case 'SIGN_OUT_USER':
            return { ...state, currentUser: null, currentJudge: null, currentAdmin: false, selectedHackathonId: null };
        default:
            return state;
    }
}


const HackathonContext = createContext<{
  state: HackathonState;
  dispatch: React.Dispatch<Action>;
  api: typeof hackathonApi;
} | undefined>(undefined);

export const HackathonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(hackathonReducer, defaultState);
  const { toast } = useToast();

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

    useEffect(() => {
        const storedCollege = localStorage.getItem('selectedCollege');
        if (storedCollege) {
            const storedHackathon = localStorage.getItem(`selectedHackathon_${storedCollege}`);
            dispatch({ type: 'SET_SELECTED_COLLEGE', payload: storedCollege });
            if (storedHackathon) {
                dispatch({ type: 'SET_SELECTED_HACKATHON', payload: storedHackathon });
            }
        } else {
            dispatch({ type: 'SET_INITIALIZED', payload: true });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    useEffect(() => {
        if (!state.selectedCollege) {
            if (state.isInitialized) {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        localStorage.setItem('selectedCollege', state.selectedCollege);
        
        // Listen to top-level collections
        const topLevelCollections = ['users', 'judges', 'announcements', 'hackathons'];
        const unsubscribes = topLevelCollections.map(col => 
            onSnapshot(collection(db, `colleges/${state.selectedCollege}/${col}`), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                dispatch({ type: 'SET_DATA', payload: { [col]: data } });
            }, (error) => console.error(`Error fetching ${col}:`, error))
        );

        // Listen to sub-collections within the selected hackathon
        let teamUnsubscribe: (() => void) | null = null;
        let projectUnsubscribe: (() => void) | null = null;
        if (state.selectedHackathonId) {
            teamUnsubscribe = onSnapshot(collection(db, `colleges/${state.selectedCollege}/hackathons/${state.selectedHackathonId}/teams`), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                dispatch({ type: 'SET_DATA', payload: { teams: data }});
            });
             projectUnsubscribe = onSnapshot(collection(db, `colleges/${state.selectedCollege}/hackathons/${state.selectedHackathonId}/projects`), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                dispatch({ type: 'SET_DATA', payload: { projects: data }});
            });
        } else {
            // Clear teams and projects if no hackathon is selected
             dispatch({ type: 'SET_DATA', payload: { teams: [], projects: [] }});
        }
        
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user && state.selectedCollege) {
                const judgeDoc = await getDoc(doc(db, `colleges/${state.selectedCollege}/judges`, user.uid));
                if (judgeDoc.exists()) {
                    dispatch({ type: 'SET_JUDGE', payload: { id: judgeDoc.id, ...judgeDoc.data() } as Judge });
                } else {
                    const userDoc = await getDoc(doc(db, `colleges/${state.selectedCollege}/users`, user.uid));
                    if (userDoc.exists()) {
                        const userData = { id: userDoc.id, ...userDoc.data() } as User;
                        dispatch({ type: 'SET_USER', payload: userData });
                        // If user has a hackathonId, set it as selected
                        if (userData.hackathonId && userData.hackathonId !== state.selectedHackathonId) {
                            dispatch({ type: 'SET_SELECTED_HACKATHON', payload: userData.hackathonId });
                        }
                    } else {
                        await hackathonApi.signOut();
                    }
                }
            } else if (!state.currentAdmin) {
                dispatch({ type: 'SIGN_OUT_USER' });
            }
            if(!state.isInitialized) {
                dispatch({ type: 'SET_INITIALIZED', payload: true });
            }
            dispatch({ type: 'SET_LOADING', payload: false });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
            if (teamUnsubscribe) teamUnsubscribe();
            if (projectUnsubscribe) projectUnsubscribe();
            unsubscribeAuth();
        };

    }, [state.selectedCollege, state.selectedHackathonId]);

    const apiWithDispatch = Object.keys(hackathonApi).reduce((acc, key) => {
        const fnName = key as keyof typeof hackathonApi;
        const fn = hackathonApi[fnName];

        (acc as any)[fnName] = async (...args: any[]) => {
            dispatch({ type: 'CLEAR_MESSAGES' });
            try {
                let collegeId = state.selectedCollege;
                // Special case for signOut, doesn't need collegeId
                if (fnName === 'signOut' || fnName === 'loginAdmin') {
                    const result = await (fn as any)(...args);
                    if (result?.successMessage) dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: result.successMessage });
                    if (fnName === 'loginAdmin' && result.isAdmin) dispatch({ type: 'SET_ADMIN', payload: true });
                    if (fnName === 'signOut') dispatch({ type: 'SIGN_OUT_USER' });
                    return result;
                }
                
                if (!collegeId) {
                    throw new Error("No college selected. Please select a college first.");
                }
                
                const result = await (fn as any)(collegeId, ...args);
                if (result?.successMessage) {
                    dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: result.successMessage });
                }
                 // If a student selects a hackathon, update state
                if (fnName === 'selectHackathonForStudent') {
                    dispatch({ type: 'SET_SELECTED_HACKATHON', payload: args[1] });
                }

                return result;
            } catch (error: any) {
                dispatch({ type: 'SET_AUTH_ERROR', payload: error.message });
                throw error;
            }
        };
        return acc;
    }, {} as typeof hackathonApi);


  return (
    <HackathonContext.Provider value={{ state, dispatch, api: apiWithDispatch }}>
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
