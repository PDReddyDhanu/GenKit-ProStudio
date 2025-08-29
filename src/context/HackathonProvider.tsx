
"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, Team, Project, Judge, Announcement, HackathonData, UserProfileData } from '../lib/types';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, where, query, getDocs } from 'firebase/firestore';
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
            return { ...state, selectedCollege: action.payload, isLoading: !!action.payload };
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
        if (!state.selectedCollege) return;
        localStorage.setItem('selectedCollege', state.selectedCollege);

        const collections = ['users', 'teams', 'projects', 'judges', 'announcements'];
        const unsubscribes = collections.map(col => 
            onSnapshot(collection(db, `colleges/${state.selectedCollege}/${col}`), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                dispatch({ type: 'SET_DATA', payload: { [col]: data } });
            })
        );
        
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if admin
                if (user.email === 'hacksprint@admin.com') {
                    dispatch({ type: 'SET_ADMIN', payload: true });
                } else {
                    // Check if judge
                    const judgeDoc = await getDoc(doc(db, `colleges/${state.selectedCollege}/judges`, user.uid));
                    if (judgeDoc.exists()) {
                        dispatch({ type: 'SET_JUDGE', payload: { id: judgeDoc.id, ...judgeDoc.data() } as Judge });
                    } else {
                        // Assume student
                        const userDoc = await getDoc(doc(db, `colleges/${state.selectedCollege}/users`, user.uid));
                        if (userDoc.exists()) {
                            dispatch({ type: 'SET_USER', payload: { id: userDoc.id, ...userDoc.data() } as User });
                        } else {
                            // User exists in Auth but not in DB for this college, log them out from this context
                            dispatch({ type: 'SET_USER', payload: null });
                        }
                    }
                }
            } else {
                dispatch({ type: 'SET_USER', payload: null });
                dispatch({ type: 'SET_JUDGE', payload: null });
                dispatch({ type: 'SET_ADMIN', payload: false });
            }
             if(!state.isInitialized) {
                dispatch({ type: 'SET_INITIALIZED', payload: true });
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
            unsubscribeAuth();
        };

    }, [state.selectedCollege, state.isInitialized]);

  const apiWithDispatch = Object.keys(hackathonApi).reduce((acc, key) => {
        const fn = (hackathonApi as any)[key];
        (acc as any)[key] = async (...args: any[]) => {
            try {
                const result = await fn(state.selectedCollege!, ...args);
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
