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
  | 'prompt-defense'
  | 'vector-search'
  | 'lora-rank'
  | 'react-agent'
  | 'latency-economics'
  | 'drift-monitor';

export type DiagramId =
  | 'python-blocks'
  | 'ml-pipeline'
  | 'neural-backprop'
  | 'transformer-attention'
  | 'hybrid-rag'
  | 'agent-guardrails';

export type ConceptReelId =
  | 'python-loop-reel'
  | 'gradient-descent-reel'
  | 'attention-reel'
  | 'rag-pipeline-reel'
  | 'agent-ticket-reel';

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
      type: 'code-builder';
      puzzleId: string;
      title: string;
      prompt: string;
      lines: string[];
      explanation: string;
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
      type: 'visual-diagram';
      diagramId: DiagramId;
      title: string;
      caption: string;
    }
  | {
      type: 'concept-reel';
      reelId: ConceptReelId;
      title: string;
      description: string;
      externalVideos?: {
        title: string;
        creator: string;
        url: string;
        duration: string;
      }[];
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
      hints?: [string, string, string];
      difficulty?: 'guided' | 'spec' | 'debug' | 'challenge';
      requires?: string[];
      packages?: string[];
      language?: 'python' | 'sql';
      setupCode?: string;
    };

export type QuizQuestionType =
  | 'multiple-choice'
  | 'predict-output'
  | 'spot-bug'
  | 'multi-select'
  | 'ordering'
  | 'numeric';

export interface QuizQuestion {
  id: string;
  type?: QuizQuestionType;
  code?: string;
  question: string;
  options: string[];
  correctIndex: number;
  correctIndices?: number[];
  items?: string[];
  correctNumber?: number;
  tolerance?: number;
  unit?: string;
  explanation: string;
}

export type LevelId = 'junior' | 'mid' | 'senior';

export type ModelRole =
  | 'small-fast'
  | 'frontier-reasoning'
  | 'embedding'
  | 'reranker'
  | 'multimodal-vision'
  | 'speech-audio'
  | 'local-open-weights';

export interface ModelCatalogEntry {
  roleId: ModelRole;
  roleLabel: string;
  lastReviewed: string;
  currentExamples: string[];
  typicalContext: string;
  useWhen: string;
  avoidWhen: string;
}

export interface Competency {
  id: string;
  level: LevelId;
  area: string;
  title: string;
  description: string;
}

export interface LevelPath {
  id: LevelId;
  title: string;
  tagline: string;
  honestEffortRange: string;
  honestScopeNote: string;
  barSummary: string;
  requiredLessonIds: string[];
  requiredLabPct: number;
  requiredModuleExams: string[];
  requiredCapstones: string[];
  requiredScenarios: string[];
  competencyIds: string[];
}

export interface CapstoneEvidence {
  projectId: string;
  repoUrl: string;
  demoUrl: string;
  evidenceJsonRaw: string;
  validatedAt: number;
  parsedSummary?: {
    passed: boolean;
    testsPassed: number;
    testsFailed: number;
    p95Ms: number;
    costPerReqUsd: number;
    secretScanPassed: boolean;
    injectionTestsPassed: boolean;
    mode: string;
  };
}

export interface ScenarioRubricItem {
  id: string;
  criterion: string;
  maxPoints: number;
  guidance: string;
}

export interface ScenarioAssessment {
  id: string;
  minLevel: LevelId;
  kind: 'system-design' | 'incident-postmortem' | 'adr';
  title: string;
  prompt: string;
  artifactTitle?: string;
  artifactContent?: string;
  rubric: ScenarioRubricItem[];
  passPoints: number;
  exampleScoredAnswer: string;
}

export interface ScenarioScoreRecord {
  scenarioId: string;
  responseText: string;
  checkedRubricIds: string[];
  selfScore: number;
  maxScore: number;
  completedAt: number;
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
  teaches?: string[];
  requires?: string[];
  competencies?: string[];
  lastReviewed?: string;
  objectives: string[];
  checkWithoutNotes?: string[];
  blocks: ContentBlock[];
  quiz: QuizQuestion[];
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  track: TrackTag;
  recommendedPath?: 'foundation' | 'ml-depth' | 'ai-eng' | 'career';
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
  level?: LevelId;
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
  quizSeed?: string;
  targetLevel?: LevelId;
  learningTrack?: 'ai-eng-fast' | 'ai-eng-full' | 'dual-ml-ai';
  fastTrackUnlocked?: boolean;
  placementScore?: { score: number; total: number };
  moduleExamScores?: Record<string, { score: number; total: number; bestScore: number }>;
  projectJournals?: Record<string, string>;
  capstoneEvidence?: Record<string, CapstoneEvidence>;
  scenarioScores?: Record<string, ScenarioScoreRecord>;
  completedLessons: string[];
  completedLabs: string[];
  completedPuzzles: string[];
  completedTickets: string[];
  completedPrReviews: string[];
  completedSetupSteps: string[];
  completedProjectSteps: string[];
  labDrafts: Record<string, string>;
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
