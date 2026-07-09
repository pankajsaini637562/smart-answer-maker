export const SUBJECTS = [
  'Physics', 'Chemistry', 'Biology', 'Mathematics',
  'English', 'Hindi', 'History', 'Geography',
  'Computer Science', 'Economics', 'Political Science',
  'General Knowledge', 'Reasoning', 'Aptitude',
] as const;

export interface OMRSheet {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  optionsPerQuestion: 4 | 5;
  timeLimit: number;
  negativeMarking: number;
  marksPerQuestion: number;
  answerKey: (number | number[])[] | null;
  createdAt: Date;
}

export interface ExamAttempt {
  id: string;
  sheetId: string;
  sheetTitle: string;
  answers: (number | null)[]; // user's selected answers (0-indexed), null means unanswered
  markedForReview: boolean[];
  questionTimes?: number[]; // silent per-question time tracking (seconds)
  startTime: Date;
  endTime: Date | null;
  timeSpent: number; // in seconds
  score: number | null;
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number;
  status: 'in-progress' | 'completed' | 'submitted';
}

export interface ExamResult {
  attemptId: string;
  sheetId: string;
  sheetTitle: string;
  totalQuestions: number;
  score: number;
  maxScore: number;
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number;
  timeSpent: number;
  completedAt: Date;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionNumber: number;
  userAnswer: number | null;
  correctAnswer: number | number[];
  isCorrect: boolean;
  marksObtained: number;
  timeSpent?: number; // seconds spent on this question
}

export interface ScoreboardEntry {
  id: string;
  sheetTitle: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: number;
  completedAt: Date;
}
