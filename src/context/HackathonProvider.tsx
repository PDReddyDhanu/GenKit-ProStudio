"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { User, Team, Project, Judge, Score, UserProfileData } from '../lib/types';
import { JUDGING_RUBRIC } from '../lib/constants';

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
}

type Action =
  | { type: 'HYDRATE_STATE'; payload: Partial<HackathonState> }
  | { type: 'REGISTER_STUDENT'; payload: { name: string; email: string; password: string } }
  | { type: 'LOGIN_STUDENT'; payload: { email: string; password: string } }
  | { type: 'CREATE_TEAM'; payload: { teamName: string } }
  | { type: 'JOIN_TEAM'; payload: { joinCode: string } }
  | { type: 'SUBMIT_PROJECT'; payload: { name: string; description: string; githubUrl: string } }
  | { type: 'ADMIN_LOGIN'; payload: { email: string; password: string } }
  | { type: 'ADMIN_ADD_JUDGE'; payload: { name: string; email: string; password: string } }
  | { type: 'ADMIN_REGISTER_STUDENT'; payload: { name: string; email: string; password: string } }
  | { type: 'ADMIN_APPROVE_STUDENT'; payload: { userId: string } }
  | { type: 'LOGIN_JUDGE'; payload: { email: string; password: string } }
  | { type: 'SCORE_PROJECT'; payload: { projectId: string; scores: Score[] } }
  | { type: 'UPDATE_USER_PROFILE', payload: { userId: string, profileData: Partial<UserProfileData> } }
  | { type: 'RESET_HACKATHON' }
  | { type: 'LOGOUT' }
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
};

function hackathonReducer(state: HackathonState, action: Action): HackathonState {
  const baseState = { ...state, authError: null, successMessage: null };

  switch (action.type) {
    case 'HYDRATE_STATE':
        return { ...state, ...action.payload, isInitialized: true };

    case 'CLEAR_MESSAGES':
        return { ...state, authError: null, successMessage: null };

    case 'REGISTER_STUDENT': {
      if (state.users.some(u => u.email.toLowerCase() === action.payload.email.toLowerCase())) {
        return { ...state, successMessage: null, authError: 'A user with this email already exists.' };
      }
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        password: action.payload.password,
        status: 'pending',
        skills: [],
        bio: '',
        github: '',
        linkedin: ''
      };
      return {
        ...baseState,
        users: [...state.users, newUser],
        successMessage: 'Registration successful! Your account is pending admin approval.'
      };
    }
    case 'LOGIN_STUDENT': {
      const user = state.users.find(u => u.email.toLowerCase() === action.payload.email.toLowerCase() && u.password === action.payload.password);
      if (user) {
        if (user.status === 'pending') {
            return { ...state, successMessage: null, authError: 'Your account is pending approval by an admin.' };
        }
        return { ...baseState, currentUser: user, currentJudge: null, currentAdmin: false, successMessage: 'Login successful!' };
      }
      return { ...state, successMessage: null, authError: 'Invalid email or password.' };
    }
    case 'CREATE_TEAM': {
      if (state.currentUser && !state.currentUser.teamId) {
        const newTeam: Team = {
          id: `team_${Date.now()}`,
          name: action.payload.teamName,
          joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          members: [state.currentUser],
        };
        const updatedUser = { ...state.currentUser, teamId: newTeam.id };
        const updatedUsers = state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u));

        return {
          ...baseState,
          teams: [...state.teams, newTeam],
          users: updatedUsers,
          currentUser: updatedUser,
          successMessage: 'Team created successfully!'
        };
      }
      return { ...state, authError: 'Could not create team.' };
    }
    case 'JOIN_TEAM': {
        if (state.currentUser && !state.currentUser.teamId) {
            const teamToJoin = state.teams.find(t => t.joinCode === action.payload.joinCode);
            if (teamToJoin) {
                const updatedUser = { ...state.currentUser, teamId: teamToJoin.id };
                const updatedTeam = { ...teamToJoin, members: [...teamToJoin.members, updatedUser] };
                 const updatedUsers = state.users.map(u => u.id === updatedUser.id ? updatedUser : u);
                const updatedTeams = state.teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
                
                // Update members array in all teams
                updatedTeams.forEach(team => {
                    team.members = team.members.map(member => updatedUsers.find(u => u.id === member.id) || member);
                });

                return {
                    ...baseState,
                    teams: updatedTeams,
                    users: updatedUsers,
                    currentUser: updatedUser,
                    successMessage: `Successfully joined team: ${teamToJoin.name}`
                };
            }
            return { ...state, authError: 'Invalid join code.' };
        }
        return { ...state, authError: 'You are already in a team or not logged in.' };
    }
    case 'SUBMIT_PROJECT': {
        const user = state.currentUser;
        if(user && user.teamId) {
            const team = state.teams.find(t => t.id === user.teamId);
            if(team && !team.projectId) {
                const newProject: Project = {
                    id: `proj_${Date.now()}`,
                    teamId: team.id,
                    ...action.payload,
                    scores: [],
                    averageScore: 0,
                };
                const updatedTeam = {...team, projectId: newProject.id};
                return {
                    ...baseState,
                    projects: [...state.projects, newProject],
                    teams: state.teams.map(t => t.id === updatedTeam.id ? updatedTeam : t),
                    successMessage: 'Project submitted successfully!'
                }
            }
        }
        return { ...state, authError: 'Could not submit project.' };
    }
    case 'ADMIN_REGISTER_STUDENT': {
        if (!state.currentAdmin) {
            return { ...state, authError: 'Only admins can register students.' };
        }
        if (state.users.some(u => u.email.toLowerCase() === action.payload.email.toLowerCase())) {
            return { ...state, authError: 'A student with this email already exists.' };
        }
        const newUser: User = {
            id: `user_${Date.now()}`,
            name: action.payload.name,
            email: action.payload.email,
            password: action.payload.password,
            status: 'approved',
            skills: [],
            bio: '',
            github: '',
            linkedin: ''
        };
        return { ...baseState, users: [...state.users, newUser], successMessage: 'Student registered and approved successfully!' };
    }
    case 'ADMIN_APPROVE_STUDENT': {
        if (!state.currentAdmin) {
            return { ...state, authError: 'Only admins can approve students.' };
        }
        const updatedUsers = state.users.map(u => u.id === action.payload.userId ? { ...u, status: 'approved' as const } : u);
        return { ...baseState, users: updatedUsers, successMessage: 'Student approved successfully!'};
    }
    case 'ADMIN_ADD_JUDGE': {
        if (!state.currentAdmin) {
            return { ...state, authError: 'Only admins can add judges.' };
        }
        if (!action.payload.email.toLowerCase().endsWith('@judge.com')) {
            return { ...state, authError: 'Judge email must end with @judge.com' };
        }
        if (state.judges.some(j => j.email.toLowerCase() === action.payload.email.toLowerCase())) {
            return { ...state, authError: 'A judge with this email already exists.' };
        }
        const newJudge: Judge = {
            id: `judge_${Date.now()}`,
            name: action.payload.name,
            email: action.payload.email,
            password: action.payload.password,
        };
        return { ...baseState, judges: [...state.judges, newJudge], successMessage: 'Judge added successfully!' };
    }
    case 'LOGIN_JUDGE': {
        const judge = state.judges.find(j => j.email.toLowerCase() === action.payload.email.toLowerCase() && j.password === action.payload.password);
        if (judge) {
            return { ...baseState, currentJudge: judge, currentUser: null, currentAdmin: false, successMessage: 'Login successful!' };
        }
        return { ...state, authError: 'Invalid judge email or password.' };
    }
    case 'ADMIN_LOGIN': {
        if (action.payload.email.toLowerCase() === 'hacksprint@admin.com' && action.payload.password === 'hack123') {
            return { ...baseState, currentAdmin: true, currentUser: null, currentJudge: null, successMessage: 'Admin login successful!' };
        }
        return { ...state, authError: 'Invalid admin credentials.' };
    }
    case 'SCORE_PROJECT': {
        if(state.currentJudge) {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if(project) {
                const otherScores = project.scores.filter(s => s.judgeId !== state.currentJudge!.id);
                const newScores = [...otherScores, ...action.payload.scores];
                
                const totalScore = newScores.reduce((sum, score) => sum + score.value, 0);
                const uniqueJudges = new Set(newScores.map(s => s.judgeId));
                const totalPossibleScore = uniqueJudges.size * JUDGING_RUBRIC.reduce((sum, c) => sum + c.max, 0);
                const averageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 10 : 0;
                
                const updatedProject = { ...project, scores: newScores, averageScore };

                return {
                    ...baseState,
                    projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
                    successMessage: 'Scores submitted successfully!'
                };
            }
        }
        return { ...state, authError: 'Could not score project.' };
    }
    case 'UPDATE_USER_PROFILE': {
        const { userId, profileData } = action.payload;
        const updatedUsers = state.users.map(u => 
            u.id === userId ? { ...u, ...profileData } : u
        );
        const updatedCurrentUser = state.currentUser?.id === userId 
            ? { ...state.currentUser, ...profileData } 
            : state.currentUser;

        // Also update the user inside any team they are a member of
        const updatedTeams = state.teams.map(team => ({
            ...team,
            members: team.members.map(member => 
                member.id === userId ? { ...member, ...profileData } : member
            )
        }));

        return {
            ...baseState,
            users: updatedUsers,
            currentUser: updatedCurrentUser,
            teams: updatedTeams,
            successMessage: 'Profile updated successfully!'
        };
    }
    case 'RESET_HACKATHON': {
      if (state.currentAdmin) {
        return {
            ...defaultState,
            currentAdmin: true,
            isInitialized: true,
            successMessage: "Hackathon data has been reset successfully."
        };
      }
      return { ...state, authError: "Only admins can reset the hackathon."};
    }
    case 'LOGOUT': {
      const { users, teams, projects, judges } = state;
        return {
            ...defaultState,
            users,
            teams,
            projects,
            judges,
            isInitialized: true,
        }
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

  useEffect(() => {
    try {
      const serializedState = localStorage.getItem('hackathonState');
      if (serializedState) {
        const storedData = JSON.parse(serializedState);
         dispatch({ type: 'HYDRATE_STATE', payload: {
            users: storedData.users || [],
            teams: storedData.teams || [],
            projects: storedData.projects || [],
            judges: storedData.judges || [],
         } });
      } else {
        dispatch({ type: 'HYDRATE_STATE', payload: {} });
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
      dispatch({ type: 'HYDRATE_STATE', payload: {} });
    }
  }, []);

  useEffect(() => {
    if (state.isInitialized) {
        try {
          const stateToPersist = {
            users: state.users,
            teams: state.teams,
            projects: state.projects,
            judges: state.judges,
          };
          localStorage.setItem('hackathonState', JSON.stringify(stateToPersist));
        } catch (error) {
          console.error('Error saving state to localStorage:', error);
        }
    }
  }, [state.users, state.teams, state.projects, state.judges, state.isInitialized]);

  return (
    <HackathonContext.Provider value={{ state, dispatch }}>
      {state.isInitialized ? children : <div className="h-screen w-full flex items-center justify-center bg-background"><p>Loading HackSprint...</p></div>}
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
