

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
  status: 'pending' | 'approved';
}

export interface Hackathon {
  id: string;
  name: string;
  prizeMoney: string;
  rules: string;
  teamSizeLimit: number;
  deadline: number; // timestamp
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface JoinRequest {
    id: string;
    name: string;
    email: string;
}

export interface TeamMember extends User {
    role?: string;
}

export interface Team {
  id: string;
  name: string;
  creatorId: string; // ID of the user who created the team
  joinCode: string;
  members: TeamMember[];
  joinRequests?: JoinRequest[]; // Array of users who requested to join
  projectId?: string;
  hackathonId: string;
  messages?: ChatMessage[];
}

export interface Project {
  id: string;
  teamId: string;
  hackathonId: string;
  name:string;
  description: string;
  githubUrl: string;
  scores: Score[];
  averageScore: number;
}

export interface Judge {
  id:string;
  name: string;
  email: string;
  // password is not stored in Firestore record for security
}

export interface Score {
  judgeId: string;
  criteria: string;
  value: number; // e.g., 1-10
  comment: string;
  memberId?: string; // Optional: To score individual members
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: number; // Creation timestamp
  publishAt?: number; // Optional: when the announcement becomes visible
  expiresAt?: number; // Optional: when the announcement is hidden
  hackathonId?: string; // Optional: scope announcements to a hackathon
}

export interface HackathonData {
    users: User[];
    teams: Team[];
    projects: Project[];
    judges: Judge[];
    announcements: Announcement[];
    hackathons: Hackathon[];
}
