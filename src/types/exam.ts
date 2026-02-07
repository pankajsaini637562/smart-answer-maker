export interface OMRSheet {
  id: string;
  title: string;
  totalQuestions: number;
  optionsPerQuestion: 4 | 5;
  timeLimit: number; // in minutes, 0 means no limit
  negativeMarking: number; // marks deducted per wrong answer
  marksPerQuestion: number;
  answerKey: (number | number[])[] | null; // null means not set yet, array of correct options (0-indexed), supports multiple correct
  createdAt: Date;
}

export interface ExamAttempt {
  id: string;
  sheetId: string;
  sheetTitle: string;
  answers: (number | null)[]; // user's selected answers (0-indexed), null means unanswered
  markedForReview: boolean[];
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
