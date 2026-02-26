import React from 'react';

// Types from Vibexathon-1.0
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Coordinator {
  name: string;
  phone: string;
  role?: string;
}

export interface Theme {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface JudgingItem {
  criteria: string;
  score: number;
}

// Types from management portal
export enum UserRole {
  PARTICIPANT = 'participant',
  JUDGE = 'judge',
  ADMIN = 'admin'
}

export enum SubmissionStatus {
  PENDING = 'pending',
  SELECTED = 'selected',
  REJECTED = 'rejected'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PENDING_VERIFICATION = 'pending_verification',
  PAID = 'paid',
  REJECTED = 'rejected'
}

export interface TeamMember {
  name: string;
  email: string;
  contact: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: number;
  utr?: string;
  screenshotUrl?: string;
  qrCodeDataUrl?: string;
  verifiedAt?: number;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface Team {
  id: string;
  teamName: string;
  leaderName: string;
  leaderContact: string;
  email: string;
  password?: string;
  members: TeamMember[];
  isVerified: boolean;
  createdAt: number;
  // Payment Details
  isIeeeMember: boolean;
  ieeeNumber?: string; // Membership ID for verification
  paymentOrder?: PaymentOrder;
  paymentId?: string;
  amountPaid?: number;
  paymentScreenshot?: string; // Base64 representation of the uploaded screenshot
  paymentVerifiedAt?: number;
  // Receipt Details
  receiptNumber?: string;
  receiptData?: {
    receiptNumber: string;
    transactionId: string;
    amount: number;
    tier: 'IEEE' | 'General';
    paymentDate: number;
    timestamp: number;
  };
}

export interface SubmissionScores {
  problemUnderstanding: number; // /15
  technicalImplementation: number; // /25
  innovation: number; // /15
  aiRigor: number; // /15
  feasibility: number; // /10
  presentation: number; // /10
  demo: number; // /10
  bonus: number; // /5
}

export interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  problemId: string;
  theme: string;
  abstract: string;
  githubLink: string;
  readmeLink?: string;
  deployLink: string;
  videoLink: string;
  submittedAt: number;
  status: SubmissionStatus;
  feedback?: string;
  scores?: SubmissionScores;
  totalScore?: number;
}

export interface SystemSettings {
  isSubmissionPortalEnabled: boolean;
  isJudgePortalEnabled: boolean;
  submissionDeadline: number;
}

export interface AppState {
  currentUser: {
    id: string;
    role: UserRole;
    teamId?: string;
    assignedDomain?: string;
  } | null;
  teams: Team[];
  submissions: Submission[];
  settings: SystemSettings;
}
