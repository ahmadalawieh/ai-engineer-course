export type TrackTag = 'core' | 'ds' | 'ai-eng';

export type SimulatorId =
  | 'vector-space'
  | 'gradient-descent'
  | 'bayes-entropy'
  | 'ab-test'
  | 'roc-threshold'
  | 'regularization'
  | 'kmeans'
  | 'neural-net'
  | 'conv-kernel'
  | 'bpe-tokenizer'
  | 'attention-map'
  | 'llm-vram'
  | 'sampling-lab'
  | 'vector-search'
  | 'lora-rank'
  | 'react-agent'
  | 'latency-economics'
  | 'drift-monitor';

export type ContentBlock =
  | {
      type: 'prose';
      heading?: string;
      paragraphs: string[];
    }
  | {
      type: 'frontend-bridge';
      title: string;
      frontendConcept: string;
      aiConcept: string;
      explanation: string;
    }
  | {
      type: 'math';
      title: string;
      latex: string;
      breakdown: { symbol: string; meaning: string }[];
      intuition: string;
    }
  | {
      type: 'code-compare';
      title: string;
      jsLabel?: string;
      jsCode: string;
      pyLabel?: string;
      pyCode: string;
      takeaway: string;
    }
  | {
      type: 'code';
      title?: string;
      language: 'python' | 'sql' | 'json' | 'bash' | 'typescript';
      code: string;
      caption?: string;
    }
  | {
      type: 'callout';
      variant: 'tip' | 'warning' | 'interview' | 'key-takeaway';
      title: string;
      body: string;
    }
  | {
      type: 'table';
      title?: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: 'simulator';
      simulatorId: SimulatorId;
      title: string;
      description: string;
    }
  | {
      type: 'python-lab';
      labId: string;
      title: string;
      prompt: string;
      starterCode: string;
      testCode: string;
      solutionCode: string;
      hint: string;
      packages?: string[];
    };

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  number: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  track: TrackTag;
  prerequisites: string[];
  objectives: string[];
  blocks: ContentBlock[];
  quiz: QuizQuestion[];
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  track: TrackTag;
  estimatedHours: number;
  capstoneDeliverable: string;
  lessons: Lesson[];
}

export interface FlashcardItem {
  id: string;
  moduleId: string;
  track: TrackTag;
  front: string;
  back: string;
  formula?: string;
  interviewTip?: string;
}

export interface GlossaryItem {
  term: string;
  moduleId: string;
  track: TrackTag;
  category: string;
  definition: string;
  formula?: string;
  example: string;
}

export interface InterviewQuestion {
  id: string;
  role: 'AI Engineer' | 'Data Scientist' | 'Both';
  difficulty: 'Core' | 'Senior' | 'Staff';
  topic: string;
  question: string;
  rubricPoints: string[];
  sampleAnswer: string;
  followUp: string;
}

export interface FlashcardReviewState {
  intervalDays: number;
  easeFactor: number;
  reps: number;
  nextReviewAt: number;
}

export interface SyncConfig {
  mode: 'none' | 'cloud-kv' | 'github-gist';
  syncKey?: string;
  gistToken?: string;
  gistId?: string;
  autoSync: boolean;
  lastSyncedAt?: number;
}

export interface CourseProgress {
  version: number;
  learnerName: string;
  completedLessons: string[];
  completedLabs: string[];
  quizScores: Record<string, { score: number; total: number; bestScore: number }>;
  notes: Record<string, string>;
  bookmarks: string[];
  flashcardSRS: Record<string, FlashcardReviewState>;
  interviewCompleted: string[];
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  lastVisitedLessonId?: string;
  updatedAt: number;
}
