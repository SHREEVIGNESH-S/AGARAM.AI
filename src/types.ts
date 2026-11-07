/**
 * Core Type Definitions for AGARAM Learning Platform
 */

export type EducationLevel = 'school' | 'high_school' | 'undergraduate' | 'postgraduate' | 'professional';

export type ExplanationStyle = 'Visual' | 'Simple' | 'Detailed' | 'Step by Step' | 'Real-world Examples';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ResponseLength = 'Short' | 'Medium' | 'Detailed';
export type PerformanceRating = 'again' | 'hard' | 'good' | 'easy';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  educationLevel: EducationLevel;
  institution?: string;
  courseOrGrade: string;
  preferredLanguage: string;
  timeZone: string;
  learningSince: string;
  preferredFormat: string;
  learningPace: 'Self-paced' | 'Accelerated' | 'Structured';
  strongestSubject: string;
  bestStudyWindow: string;
  studyStreakDays: number;
  studySessionsCount: number;
  assignmentsCount: number;
  revisionDueCount: number;
  nextExamDate: string;
  nextExamSubject: string;
  overallMastery: number;
  knowledgeGapsCount: number;
  // Learning behavior metrics
  consistencyScore: number; // 0-100
  questionAttempts: number;
  skipFrequency: string;
  averageStudyDurationMinutes: number;
  strengths: string[];
  growthAreas: string[];
  avatar?: string;
  voiceGender?: 'male' | 'female';
}

export type TopicStatus = 'Mastered' | 'In Progress' | 'Up Next' | 'Locked';

export interface Topic {
  id: string;
  subjectId: string;
  order: number;
  title: string;
  description: string;
  status: TopicStatus;
  masteryPercentage: number;
  practiceScore: number;
  confidenceRating: number; // 1-5
  lastStudiedDate: string;
  lessonContent?: string;
  keyFormulasOrRules?: string[];
}

export interface Subject {
  id: string;
  name: string;
  iconName?: string;
  educationLevel: EducationLevel;
  classOrCourse: string;
  syllabus?: string;
  description: string;
  learningGoals?: string[];
  totalTopics: number;
  masteredTopics: number;
  masteryPercentage: number;
  lastStudiedDate: string;
  lastStudiedFormatted: string;
  monthlyProgress: number; // e.g. +14%
  practiceScore: number;
  isArchived?: boolean;
}

export type MemoryClassification = 'Retained' | 'Pattern' | 'Effective' | 'Misconception';

export interface MemoryRecord {
  id: string;
  topicTitle: string;
  subjectName: string;
  observation: string;
  classification: MemoryClassification;
  timestamp: string;
  actionableInsight: string;
  evidenceCount: number;
}

export interface KnowledgeGap {
  id: string;
  subject: string;
  topicId: string;
  conceptName: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  confidenceVsAccuracy: string;
  recommendedAction: string;
  cleared: boolean;
  detectedDate: string;
}

export interface RevisionItem {
  id: string;
  subject: string;
  topicId: string;
  conceptName: string;
  duePeriod: 'Today' | 'Tomorrow' | 'Friday' | 'This Week' | 'Recovered';
  currentIntervalDays: number;
  consecutiveRecallCount: number;
  lastReviewedDate: string;
  status: 'Pending' | 'Completed' | 'Postponed';
  sampleQuestion?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'code' | 'true_false' | 'fill_in_blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  codeSnippet?: string;
  topicName: string;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  mode: 'Quick Quiz' | 'Adaptive Test' | 'Targeted Practice';
  estimatedDurationMinutes: number;
  questionsCount: number;
  questions: AssessmentQuestion[];
  completed?: boolean;
  score?: number;
  accuracyPercentage?: number;
  timeSpentSeconds?: number;
  confidenceGapPercentage?: number;
  topicBreakdown?: Array<{ topic: string; scorePercentage: number }>;
  recommendedActions?: string[];
  completedAt?: string;
}

export interface ChatAttachment {
  id?: string;
  fileName: string;
  fileType: string; // 'image/png', 'application/pdf', etc.
  fileSizeFormatted: string;
  dataUrl?: string; // Base64 data for images or previews
  extractedText?: string; // Text content extracted from PDF or image
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'agaram';
  text: string;
  codeSnippet?: string;
  codeLanguage?: string;
  suggestedActions?: string[];
  relatedConcepts?: string[];
  timestamp: string;
  explanationStyleUsed?: ExplanationStyle;
  attachments?: ChatAttachment[];
}

export interface Conversation {
  id: string;
  studentId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicTitle?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
  isArchived?: boolean;
  isStructuredLesson?: boolean;
}

export interface TutorControls {
  explanationStyle: ExplanationStyle;
  difficulty: DifficultyLevel;
  contextMemory: boolean;
  responseLength: ResponseLength;
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: string;
  subjectId: string;
  uploadedAt: string;
  fileSizeFormatted: string;
  chunkCount: number;
  extractedSnippet: string;
}

export interface StudySummary {
  id: string;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  content: string;
  keyIdeas: string[];
  commonMistakes: string[];
  workedExample?: string;
  practiceQuestions?: string[];
  createdAt: string;
}

// Collaborative Learning Types
export interface GroupAnswer {
  id: string;
  questionId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  isAccepted?: boolean;
}

export interface GroupQuestion {
  id: string;
  groupId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  subject: string;
  topicName?: string;
  createdAt: string;
  answers: GroupAnswer[];
  tags: string[];
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  iconName?: string;
  memberCount: number;
  isMember: boolean;
  meetingTime?: string;
  sharedDocumentIds: string[];
  questions: GroupQuestion[];
  createdAt: string;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'mastery' | 'streak' | 'assessment' | 'collaboration';
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  avatar: string;
  points: number;
  streakDays: number;
  level: number;
  topSubject: string;
  badgesCount: number;
  isCurrentUser: boolean;
}

export interface GamificationState {
  points: number;
  level: number;
  nextLevelPoints: number;
  badges: Badge[];
  recentXpGains: Array<{ reason: string; points: number; timestamp: string }>;
}

export interface HindsightStatus {
  enabled: boolean;
  connected: boolean;
  tested: boolean;
  apiVersion?: string;
  bankId?: string;
  baseUrl?: string;
  features?: Record<string, boolean>;
  error?: string;
  lastChecked?: string;
}

export interface HindsightMemoryItem {
  id?: string;
  text: string;
  context?: string;
  timestamp?: string;
  type?: string;
  tags?: string[];
  score?: number;
}


