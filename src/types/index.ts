export type Language = 'en' | 'hi' | 'bn';

export type ExamCategory = 'ssc' | 'railways' | 'banking' | 'defence' | 'state_psc';

export interface ExamPattern {
  id: string;
  examId: string;
  tier: string;
  title: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  marksPerCorrect: number;
  negativeMarking: number;
  hasSectionalTiming: boolean;
  sectionalTimingMinutes?: number;
  sections: {
    name: string;
    code: string;
    questionCount: number;
    marksPerQuestion: number;
  }[];
}

export interface Exam {
  id: string;
  code: string;
  name: string;
  category: ExamCategory;
  conductingBody: string;
  badge: string;
  description: string;
  eligibility: string;
  tiers: ExamPattern[];
  languages: Language[];
  officialUrl: string;
  stats: {
    annualApplicants: string;
    pyqCount: number;
    mockCount: number;
    avgCutoff: string;
  };
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  nameHi: string;
  nameBn: string;
  icon: string;
  description: string;
  totalQuestionsCount: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  code: string;
  name: string;
  nameHi: string;
  nameBn: string;
  weightage: number; // 1 - 5
  description: string;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type PaletteState = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_and_marked';

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  textHi?: string;
  textBn?: string;
  isCorrect?: boolean; // strictly hidden during CBT active session
}

export interface QuestionProvenance {
  examCode: string;
  examName: string;
  year: number;
  shift: number;
  tier: string;
  examDate?: string;
  sourceType: 'Official Paper' | 'AI Practice Model' | 'Licensed Question Bank';
  documentReference?: string;
}

export interface KidExplanation {
  simpleStory?: string;
  babySteps: string[];
  whyLikeThis?: string; // Specially for English: tells the answer and why like this
  whyOptionsWrong?: { option: string; reason: string }[];
  commonTrap?: string;
  memoryHack?: string;
}

export interface Question {
  id: string;
  subjectCode: string;
  topicCode: string;
  questionText: string;
  questionTextHi?: string;
  questionTextBn?: string;
  diagramUrl?: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: {
    standard: string;
    beginner?: string;
    shortcut?: string;
    kidFriendly?: KidExplanation;
  };
  difficulty: QuestionDifficulty;
  isVerified: boolean;
  isAiGenerated: boolean;
  marks: number;
  negativeMarks: number;
  provenance: QuestionProvenance;
  status: 'approved' | 'pending' | 'flagged';
  duplicateHash?: string;
}

export type TestMode = 'official_simulation' | 'custom_mock' | 'topic_practice';

export interface TestConfiguration {
  id: string;
  title: string;
  mode: TestMode;
  targetExamId: string;
  patternTier?: string;
  subjectCodes: string[];
  topicCodes?: string[];
  questionCount: number;
  durationMinutes: number;
  marksPerCorrect: number;
  negativeMarking: number;
  allowPause: boolean;
  difficulty?: QuestionDifficulty | 'mixed';
  sourceFilter: 'verified_only' | 'all' | 'ai_augmented';
  hasSectionalTiming?: boolean;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedOption?: 'A' | 'B' | 'C' | 'D';
  paletteState: PaletteState;
  timeSpentSeconds: number;
  visited: boolean;
}

export interface TestSessionState {
  testId: string;
  config: TestConfiguration;
  questions: Question[];
  currentQuestionIndex: number;
  currentSectionIndex: number;
  answers: Record<string, UserAnswerRecord>;
  timeRemainingSeconds: number;
  isPaused: boolean;
  isSubmitted: boolean;
  startedAt: string;
  lastSavedAt: string;
}

export interface QuestionResultBreakdown {
  question: Question;
  userSelected?: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  isAttempted: boolean;
  marksAwarded: number;
  timeSpentSeconds: number;
  timeClassification: 'fast_correct' | 'slow_correct' | 'careless_error' | 'time_trap' | 'skipped';
}

export interface TestSummaryReport {
  attemptId: string;
  testId: string;
  title: string;
  mode: TestMode;
  examName: string;
  startedAt: string;
  submittedAt: string;
  totalTimeSpentSeconds: number;
  totalQuestions: number;
  attemptedQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  totalScore: number;
  maxMarks: number;
  accuracyPercentage: number;
  percentileEstimate: number;
  projectedRank: number;
  sectionBreakdown: {
    sectionName: string;
    totalQuestions: number;
    attempted: number;
    correct: number;
    score: number;
    accuracy: number;
  }[];
  topicBreakdown: {
    topicCode: string;
    topicName: string;
    total: number;
    correct: number;
    accuracy: number;
    isWeak: boolean;
  }[];
  questionResults: QuestionResultBreakdown[];
  aiAnalysisRecommendation?: string;
}

export interface MistakeNotebookItem {
  id: string;
  questionId: string;
  questionText: string;
  correctAnswer: string;
  userAnswer?: string;
  explanation: string;
  topicName: string;
  examName: string;
  tag: 'calculation_error' | 'concept_gap' | 'silly_mistake' | 'time_pressure' | 'misread_question';
  dateAdded: string;
  notes?: string;
  resolved: boolean;
}

export interface BookmarkItem {
  id: string;
  questionId: string;
  question: Question;
  addedAt: string;
  personalNotes?: string;
}

export interface SubscriptionInfo {
  isActive: boolean;
  planId?: 'sprint_5' | 'monthly_10' | 'quarterly_25' | 'half_yearly_45' | 'yearly_79' | 'lifetime_149' | 'custom';
  planName?: string;
  price?: number;
  activatedAt?: string;
  expiresAt?: string;
  activationCodeUsed?: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  planTier: 'sprint_5' | 'monthly_10' | 'quarterly_25' | 'half_yearly_45' | 'yearly_79' | 'lifetime_149';
  planName: string;
  price: number;
  durationDays: number;
  createdAt: string;
  isUsed: boolean;
  usedByPhone?: string;
  usedAt?: string;
}

export interface PaymentSubmission {
  id: string;
  userPhone: string;
  userName: string;
  amount: number;
  transactionId: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  generatedCode?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  targetExams: string[];
  preferredLanguage: Language;
  streakDays: number;
  totalQuestionsPracticed: number;
  overallAccuracy: number;
  role: 'student' | 'admin';
  subscription: SubscriptionInfo;
  dailyTestsTaken: Record<string, number>; // date "YYYY-MM-DD" -> count
}

