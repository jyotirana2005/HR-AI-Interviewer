export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'candidate' | 'hr' | 'admin';
  createdAt: string;
  avatar?: string;
  isVerified: boolean;
  company?: string;
  hrId?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  companyExperience?: number;
  areasOfExpertise?: string[];
  lastUpdated?: string;
}

export interface StudentInfo {
  name: string;
  email: string;
  phone: string;
  education: string;
  major: string;
  graduationYear: string;
  experience: string;
  skills: string[];
  profilePhoto?: string;
  userId?: string;
  lastUpdated?: string;
  certifications?: string[];
  profileCompletion?: number;
}

export interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string;
  level: 'entry' | 'mid' | 'senior';
  type: 'hr' | 'technical';
  timestamp?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'behavioral' | 'technical' | 'situational';
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  audioUrl?: string;
  department?: string;
  category?: string;
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
}

export interface InterviewResponse {
  questionId: string;
  answer: string;
  audioBlob?: Blob;
  duration: number;
  confidence: number;
  clarity: number;
  emotionalTone: string;
  keywords?: string[];
  relevanceScore?: number;
}

export interface InterviewResult {
  overallScore: number;
  categoryScores: {
    communication: number;
    technical: number;
    confidence: number;
    clarity: number;
    emotionalIntelligence: number;
  };
  responses: InterviewResponse[];
  feedback: string[];
  recommendations: string[];
  strengths: string[];
  areasForImprovement: string[];
  interviewDuration: number;
  completionRate: number;
  detailedAnalysis?: {
    responseQuality: number;
    technicalAccuracy: number;
    communicationSkills: number;
    problemSolvingAbility: number;
  };
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobDescription: JobDescription;
  studentInfo: StudentInfo;
  questions: Question[];
  responses: InterviewResponse[];
  result: InterviewResult | null;
  status: 'setup' | 'in-progress' | 'paused' | 'completed' | 'stopped';
  createdAt: string;
  completedAt?: string;
  duration: number;
  currentQuestionIndex: number;
}

export interface AIBotState {
  isListening: boolean;
  isSpeaking: boolean;
  currentEmotion: 'neutral' | 'happy' | 'thinking' | 'concerned';
  message: string;
  isWaitingForResponse: boolean;
}

export interface HRDashboardStats {
  totalInterviews: number;
  todayInterviews: number;
  averageScore: number;
  completionRate: number;
  topSkills: string[];
  recentInterviews: InterviewSession[];
  monthlyTrends: Array<{
    month: string;
    interviews: number;
    avgScore: number;
  }>;
  skillsDistribution: Array<{
    skill: string;
    count: number;
    avgScore: number;
  }>;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalInterviews: number;
  totalCompanies: number;
  todayInterviews: number;
  averageScore: number;
  completionRate: number;
  companyWiseStats: Array<{
    company: string;
    interviews: number;
    avgScore: number;
    candidates: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    interviews: number;
    avgScore: number;
  }>;
  topPerformingCompanies: Array<{
    company: string;
    avgScore: number;
    interviews: number;
  }>;
  skillsAnalysis: Array<{
    skill: string;
    frequency: number;
    avgScore: number;
  }>;
  recentInterviews: InterviewSession[];
}

export interface CameraCheckResult {
  isWorking: boolean;
  hasPermission: boolean;
  deviceCount: number;
  errorMessage?: string;
  troubleshootingSteps?: string[];
}

export interface ProfileUpdateHistory {
  id: string;
  userId: string;
  changes: Record<string, { old: any; new: any }>;
  updatedAt: string;
  updatedBy: string;
}