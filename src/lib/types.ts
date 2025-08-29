export interface UserProfileData {
  name: string;
  skills: string[];
  bio: string;
  github: string;
  linkedin: string;
}

export interface User extends UserProfileData {
  id: string;
  email: string;
  // password is not stored in Firestore record for security
  teamId?: string;
  status: 'pending' | 'approved';
}

export interface Team {
  id: string;
  name: string;
  joinCode: string;
  members: User[];
  projectId?: string;
}

export interface Project {
  id: string;
  teamId: string;
  name:string;
  description: string;
  githubUrl: string;
  scores: Score[];
  averageScore: number;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
  // password is not stored in Firestore record for security
}

export interface Score {
  judgeId: string;
  criteria: string;
  value: number; // e.g., 1-10
  comment: string;
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: number;
}

export interface HackathonData {
    users: User[];
    teams: Team[];
    projects: Project[];
    judges: Judge[];
    announcements: Announcement[];
}
