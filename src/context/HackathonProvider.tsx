
"use client";

import React, { createContext, useContext, ReactNode, useEffect, useReducer } from 'react';
import { User, Team, Project, Judge, Announcement } from '../lib/types';
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
  currentUser: User | null;
  currentJudge: Judge | null;
  currentAdmin: boolean;
  selectedCollege: string | null;
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
  currentUser: null,
  currentJudge: null,
  currentAdmin: false,
  selectedCollege: null,
  authError: null,
  successMessage: null,
  isInitialized: false,
  isLoading: true,
};

type Action =
  | { type: 'SET_DATA'; payload: Partial<HackathonState> }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_JUDGE'; payload: Judge | null }
  | { type: 'SET_ADMIN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_SELECTED_COLLEGE'; payload: string | null }
  | { type: 'SET_AUTH_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' };

function hackathonReducer(state: HackathonState, action: Action): HackathonState {
    switch (action.type) {
        case 'SET_DATA':
            return { ...state, ...action.payload };
        case 'SET_USER':
            return { ...state, currentUser: action.payload, currentJudge: null, currentAdmin: false, isLoading: false };
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
                // Reset data when college changes
                return {
                    ...defaultState,
                    selectedCollege: college,
                    isInitialized: state.isInitialized,
                    successMessage: `Welcome to ${college}!`,
                };
            }
            return { ...state, selectedCollege: college, isLoading: !!college };
        case 'SET_AUTH_ERROR':
            return { ...state, authError: action.payload };
        case 'SET_SUCCESS_MESSAGE':
            return { ...state, successMessage: action.payload };
        case 'CLEAR_MESSAGES':
            return { ...state, authError: null, successMessage: null };
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
            dispatch({ type: 'SET_SELECTED_COLLEGE', payload: storedCollege });
        } else {
            dispatch({ type: 'SET_INITIALIZED', payload: true });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    useEffect(() => {
        if (!state.selectedCollege && state.isInitialized) {
            // If initialized and no college is selected, we are on the college login page.
            // No need to set up listeners or check auth state.
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }
        
        if (!state.selectedCollege) return;
        
        dispatch({ type: 'SET_LOADING', payload: true });
        localStorage.setItem('selectedCollege', state.selectedCollege);

        const collections = ['users', 'teams', 'projects', 'judges', 'announcements'];
        const unsubscribes = collections.map(col => 
            onSnapshot(collection(db, `colleges/${state.selectedCollege}/${col}`), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                dispatch({ type: 'SET_DATA', payload: { [col]: data } });
            }, (error) => {
                console.error(`Error fetching ${col}:`, error);
                dispatch({ type: 'SET_AUTH_ERROR', payload: `Could not load ${col} data.`})
            })
        );
        
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const judgeDoc = await getDoc(doc(db, `colleges/${state.selectedCollege}/judges`, user.uid));
                if (judgeDoc.exists()) {
                    dispatch({ type: 'SET_JUDGE', payload: { id: judgeDoc.id, ...judgeDoc.data() } as Judge });
                } else {
                    const userDoc = await getDoc(doc(db, `colleges/${state.selectedCollege}/users`, user.uid));
                    if (userDoc.exists()) {
                        dispatch({ type: 'SET_USER', payload: { id: userDoc.id, ...userDoc.data() } as User });
                    } else {
                        // User exists in auth, but not in this college's DB. Sign them out.
                        await hackathonApi.signOut();
                    }
                }
            } else if (!state.currentAdmin) { // Don't clear user if admin is active (since admin doesn't use Firebase Auth)
                dispatch({ type: 'SET_USER', payload: null });
                dispatch({ type: 'SET_JUDGE', payload: null });
            }
             if(!state.isInitialized) {
                dispatch({ type: 'SET_INITIALIZED', payload: true });
            }
            dispatch({ type: 'SET_LOADING', payload: false });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
            unsubscribeAuth();
        };

    }, [state.selectedCollege, state.isInitialized, state.currentAdmin]);

  const apiWithDispatch = Object.keys(hackathonApi).reduce((acc, key) => {
        const fnName = key as keyof typeof hackathonApi;
        const fn = hackathonApi[fnName];

        if (fnName === 'loginAdmin') {
            (acc as any)[fnName] = async (credentials: any) => {
                dispatch({ type: 'CLEAR_MESSAGES' });
                try {
                    const result = await fn(credentials); // No collegeId needed for loginAdmin
                     if (result.isAdmin) {
                        dispatch({ type: 'SET_ADMIN', payload: true });
                        dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: result.successMessage as string });
                    }
                    return result;
                } catch (error: any) {
                    dispatch({ type: 'SET_AUTH_ERROR', payload: error.message });
                    throw error;
                }
            };
        } else {
            (acc as any)[fnName] = async (...args: any[]) => {
                dispatch({ type: 'CLEAR_MESSAGES' });
                try {
                    // Pass collegeId as the first argument
                    const result = await (fn as any)(state.selectedCollege, ...args);
                    if (result?.successMessage) {
                        dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: result.successMessage });
                    }
                    return result;
                } catch (error: any) {
                    dispatch({ type: 'SET_AUTH_ERROR', payload: error.message });
                    throw error;
                }
            };
        }
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
