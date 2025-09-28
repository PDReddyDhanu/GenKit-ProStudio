

export interface UserProfileData {
  name: string;
  skills: string[];
  bio: string;
  github: string;
  linkedin: string;
  workStyle?: string[];
}

export interface Notification {
  id: string;
  message: string;
  link: string; // e.g., /support/tickets/ticket-id
  timestamp: number;
  isRead: boolean;
}

export interface User extends UserProfileData {
  id: string;
  email: string;
  rollNo: string;
  branch: string;
  department: string;
  section: string;
  status: 'pending' | 'approved';
  guidanceHistory?: ChatMessage[];
  notifications?: Notification[];
  registeredAt?: number;
  approvalReminderSentAt?: number;
}

export interface Department {
    id: string;
    name: string;
}

export interface College {
    id: string;
    name: string;
    departments: Department[];
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
  projectId?: string;
  notifications?: Notification[];
  messages?: ChatMessage[];
  joinRequests?: JoinRequest[]; // Array of users who requested to join
  hackathonId?: string; 
}

export interface Project {
  id: string;
  teamId: string;
  title: string;
  name: string; // TBD: Consolidate with title
  description: string;
  projectType: 'Real-Time' | 'Mini' | 'Major' | 'Other';
  abstractFileUrl?: string;
  githubUrl: string;
  deployedUrl?: string;
  status: 'PendingGuide' | 'PendingR&D' | 'PendingHoD' | 'Approved' | 'Rejected';
  scores: Score[];
  averageScore: number;
  submittedAt?: number;
  hackathonId?: string; // This links the project to an event/term
  achievements?: string[];
  imageUrl?: string;
}

export interface Faculty {
  id:string;
  name: string;
  email: string;
  role: 'guide' | 'hod' | 'rnd' | 'external' | 'admin' | 'sub-admin' | 'academic-coordinator' | 'class-mentor';
  guidanceHistory?: ChatMessage[];
  gender?: 'Male' | 'Female' | 'Other';
  contactNumber?: string;
  bio?: string;
  notifications?: Notification[];
  designation?: 'Professor' | 'Associate Professor' | 'Assistant Professor';
  education?: 'PhD' | 'M.Tech' | 'B.Tech' | 'Other';
  branch?: string;
  department?: string;
  collegeName?: string; // For external faculty
  status?: 'pending' | 'approved'; // Added for approval workflow
}

export interface Score {
  evaluatorId: string;
  criteria: string;
  value: number; // e.g., 1-10
  comment: string;
  memberId?: string; // Optional: to score individual members
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: number; // Creation timestamp
  publishAt?: number; // Optional: when the announcement becomes visible
  expiresAt?: number; // Optional: when the announcement is hidden
}

export interface SupportResponse {
    id: string;
    responderId: string;
    responderName: string;
    message: string;
    timestamp: number;
}


export interface SupportTicket {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    subject: string;
    description: string;
    submittedAt: number;
    status: 'New' | 'In Progress' | 'Resolved';
    priority: 'Low' | 'Medium' | 'High';
    category: string;
    suggestedResponse?: string;
    responses?: SupportResponse[];
    hackathonId?: string | null;
}


export interface AppData {
    users: User[];
    teams: Team[];
    projects: Project[];
    faculty: Faculty[];
    announcements: Announcement[];
    supportTickets: SupportTicket[];
}

export interface Hackathon {
    id: string;
    name: string;
    prizeMoney: string;
    rules: string;
    teamSizeLimit: number;
    deadline: number;
    summaryImageUrl?: string;
}
