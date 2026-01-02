
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for auth simulation
  role: UserRole;
  avatar: string;
  mood?: string;
}

export enum TaskStatus {
  IDEAS = 'Ideias',
  TODO = 'A Fazer',
  IN_PROGRESS = 'Em Andamento',
  WAITING = 'Aguardando',
  DONE = 'Concluída',
  CANCELLED = 'Cancelada',
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

export interface HistoryLog {
  id: string;
  action: string;
  timestamp: number;
  userId: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // Tailwind class like 'bg-red-200 text-red-800'
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskOrigin = 'Tráfego Pago' | 'Instagram/Facebook' | 'TikTok' | 'YouTube' | 'Banner' | 'Panfleto' | 'Mídia Off' | 'Outros';

export type SocialPlatform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'Twitter' | 'WhatsApp' | 'TikTok';

export interface Task {
  id: string;
  title: string;
  description: string;
  caption?: string; // New field for "Legenda"
  status: TaskStatus;
  columnId: string;
  assigneeId: string;
  creatorId: string;
  createdAt: number;
  dueDate: number;
  postDate?: number; // New field for "Data de Post"
  origin?: TaskOrigin; // Old field for "Origem"
  socialPlatform?: SocialPlatform; // New specific field for Social Media Page
  completedAt?: number;
  tags: Tag[];
  emoji: string;
  imageUrl?: string;
  attachments?: string[]; // Array of image URLs for carousels
  link?: string;
  comments: Comment[];
  history: HistoryLog[];
  isApprovalRequested: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'none';
  approvalFeedback?: string;
  
  // New Fields
  subtasks: Subtask[];
  estimatedHours: number; // e.g., 3.5 hours
  timeSpent: number; // milliseconds accumulated
  isTimerRunning: boolean;
  lastTimerStart?: number; // timestamp when status moved to In Progress
}

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  timestamp: number;
  type: 'info' | 'alert' | 'success';
}

export interface Meeting {
  id: string;
  title: string;
  date: number;
  googleCalendarEventId?: string;
}

export interface Note {
  id: string;
  text: string;
  updatedAt: number;
}

// --- Traffic Page Types ---
export interface TrafficCustomColumn {
    id: string;
    title: string;
}

export interface TrafficPlanningColumn {
    id: string;
    title: string;
}

export interface TrafficCampaign {
    id: string;
    platform: SocialPlatform;
    name: string;
    isActive: boolean;
    budgetMonth: number;
    budgetDaily: number;
    spent: number;
    cpc: number;
    conversions: number;
    roi: number;
    
    // Details
    creativeUrl?: string;
    caption?: string;
    objective?: string;
    startDate: number;
    endDate?: number;
    
    // Planning / Targets
    leadsTarget?: number;
    salesTarget?: number;
    
    // Results (Actuals)
    leadsResult?: number;
    salesResult?: number;
    
    // Dynamic values for custom columns
    customValues: Record<string, string>; 
    planningCustomValues: Record<string, string>;
}
