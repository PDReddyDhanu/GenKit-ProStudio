
"use client";

import React, { createContext, useContext, ReactNode, useEffect, useReducer } from 'react';
import { User, Team, Project, Judge, Announcement, Hackathon, SupportTicket, Faculty } from '../lib/types';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import * as hackathonApi from '@/lib/hackathon-api';

interface AppState {
  users: User[];
  teams: Team[];
  projects: Project[];
  faculty: Faculty[];
  announcements: Announcement[];
  hackathons: Hackathon[];
  supportTickets: SupportTicket[];
  currentUser: User | null;
  currentFaculty: Faculty | null;
  currentAdmin: boolean;
  selectedCollege: string | null;
  selectedHackathonId: string | null; // Renamed for clarity
  authError: string | null;
  successMessage: string | null;
  isInitialized: boolean;
  isLoading: boolean;
}

const defaultState: AppState = {
  users: [],
  teams: [],
  projects: [],
  faculty: [],
  announcements: [],
  hackathons: [],
  supportTickets: [],
  currentUser: null,
  currentFaculty: null,
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
  | { type: 'SET_FACULTY'; payload: Faculty | null }
  | { type: 'SET_ADMIN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_SELECTED_COLLEGE'; payload: string | null }
  | { type: 'SET_SELECTED_HACKATHON'; payload: string | null }
  | { type: 'SET_AUTH_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SIGN_OUT_USER' };

function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_DATA':
            let updatedState = { ...state, ...action.payload };
             if (action.payload.users) {
                const updatedCurrentUser = action.payload.users.find((u: User) => u.id === state.currentUser?.id);
                if (updatedCurrentUser) {
                    updatedState.currentUser = updatedCurrentUser;
                }
            }
             if (action.payload.faculty) {
                const updatedCurrentFaculty = action.payload.faculty.find((f: Faculty) => f.id === state.currentFaculty?.id);
                if (updatedCurrentFaculty) {
                    updatedState.currentFaculty = updatedCurrentFaculty;
                }
            }
            return updatedState;
        case 'SET_USER':
            return { ...state, currentUser: action.payload, currentFaculty: null, currentAdmin: false, isLoading: false };
        case 'SET_FACULTY':
            return { ...state, currentFaculty: action.payload, currentUser: null, currentAdmin: false, isLoading: false };
        case 'SET_ADMIN':
            return { ...state, currentAdmin: action.payload, currentUser: null, currentFaculty: null, isLoading: false };
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
             if (action.payload && state.selectedCollege) {
                localStorage.setItem(`selectedEvent_${state.selectedCollege}`, action.payload);
            } else if (state.selectedCollege) {
                localStorage.removeItem(`selectedEvent_${state.selectedCollege}`);
            }
            return { ...state, selectedHackathonId: action.payload };
        case 'SET_AUTH_ERROR':
            return { ...state, authError: action.payload };
        case 'SET_SUCCESS_MESSAGE':
            return { ...state, successMessage: action.payload };
        case 'CLEAR_MESSAGES':
            return { ...state, authError: null, successMessage: null };
        case 'SIGN_OUT_USER':
            return { ...state, currentUser: null, currentFaculty: null, currentAdmin: false, selectedHackathonId: null };
        default:
            return state;
    }
}


const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  api: typeof hackathonApi;
} | undefined>(undefined);

export const HackathonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, defaultState);
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
            const storedEvent = localStorage.getItem(`selectedEvent_${storedCollege}`);
            if (storedEvent) {
                dispatch({ type: 'SET_SELECTED_HACKATHON', payload: storedEvent });
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
        
        const topLevelCollections = ['users', 'faculty', 'announcements', 'hackathons', 'teams', 'projects', 'supportTickets'];
        const unsubscribes = topLevelCollections.map(col => 
            onSnapshot(collection(db, `colleges/${state.selectedCollege}/${col}`), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                dispatch({ type: 'SET_DATA', payload: { [col]: data } });
            }, (error) => console.error(`Error fetching ${col}:`, error))
        );
        
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user && state.selectedCollege) {
                const facultyDoc = await getDoc(doc(db, `colleges/${state.selectedCollege}/faculty`, user.uid));
                if (facultyDoc.exists()) {
                    dispatch({ type: 'SET_FACULTY', payload: { id: facultyDoc.id, ...facultyDoc.data() } as Faculty });
                } else {
                    const userDoc = await getDoc(doc(db, `colleges/${state.selectedCollege}/users`, user.uid));
                    if (userDoc.exists()) {
                        const userData = { id: userDoc.id, ...userDoc.data() } as User;
                        if (userData.status === 'approved') {
                            dispatch({ type: 'SET_USER', payload: userData });
                        } else {
                             if (state.currentUser) {
                                dispatch({ type: 'SIGN_OUT_USER' });
                            }
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
            unsubscribeAuth();
        };

    }, [state.selectedCollege]);

    const apiWithDispatch = Object.keys(hackathonApi).reduce((acc, key) => {
        const fnName = key as keyof typeof hackathonApi;
        const fn = hackathonApi[fnName];

        (acc as any)[fnName] = async (...args: any[]) => {
            dispatch({ type: 'CLEAR_MESSAGES' });
            try {
                let collegeId = state.selectedCollege;
                
                if (fnName === 'loginFaculty') {
                    if (!collegeId) {
                        throw new Error("No college selected. Please select a college first.");
                    }
                    const result = await (fn as any)(collegeId, args[0]);
                     if (result?.successMessage) {
                        dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: result.successMessage });
                    }
                    if (result?.faculty) {
                        dispatch({ type: 'SET_FACULTY', payload: result.faculty });
                    }
                    return result;
                }

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

                return result;
            } catch (error: any) {
                dispatch({ type: 'SET_AUTH_ERROR', payload: error.message });
                throw error;
            }
        };
        return acc;
    }, {} as typeof hackathonApi);


  return (
    <AppContext.Provider value={{ state, dispatch, api: apiWithDispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useHackathon = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useHackathon must be used within a HackathonProvider');
  }
  return context;
};
