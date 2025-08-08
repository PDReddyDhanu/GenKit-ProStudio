export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // WARNING: In a real app, never store plaintext passwords
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
  name: string;
  description: string;
  githubUrl: string;
  scores: Score[];
  averageScore: number;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
  password: string; // WARNING: In a real app, never store plaintext passwords
}

export interface Score {
  judgeId: string;
  criteria: string;
  value: number; // e.g., 1-10
  comment: string;
}
