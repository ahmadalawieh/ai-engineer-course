export type OsPlatform = 'windows' | 'mac';

export interface OsSetupGuide {
  commands: string[];
  whatYouSee: string;
  commonFix: string;
}

export interface LessonConceptStep {
  headline: string;
  paragraphs: string[];
  analogy: {
    fromKnown: string; // e.g., "HTML / WordPress / Excel / SQL"
    explanation: string;
  };
  visualFlow: [string, string, string];
  proTerm?: {
    term: string;
    plainMeaning: string;
  };
}

export interface LessonPcSetupStep {
  title: string;
  summary: string;
  checklist?: string[];
  windows: OsSetupGuide;
  mac: OsSetupGuide;
}

export interface LessonPracticeStep {
  taskPrompt: string;
  language: 'python' | 'sql';
  setupCode?: string;
  warmUpCode: string;
  warmUpNote: string;
  starterCode: string;
  hints: [string, string];
  solutionCode: string;
  testCode: string;
}

export interface LessonProjectStep {
  projectTitle: string;
  fileName: string;
  summary: string;
  codeSnippet: string;
  runCommandWin: string;
  runCommandMac: string;
}

export interface JourneyLesson {
  id: string; // e.g. "1-1"
  stageNumber: number; // 1..7
  lessonNumber: string; // "1.1"
  title: string;
  PlainSubtitle: string;
  minutes: number;
  xp: number;
  concept: LessonConceptStep;
  pcSetup: LessonPcSetupStep;
  practice: LessonPracticeStep;
  projectStep: LessonProjectStep;
}

export interface JourneyProjectSpec {
  id: string;
  stageNumber: number;
  title: string;
  tagline: string;
  whatYouBuild: string;
  skillsUsed: string[];
  zipUrl: string;
  winQuickstart: string[];
  macQuickstart: string[];
}

export interface JourneyStage {
  stageNumber: number;
  shortTitle: string;
  title: string;
  goal: string;
  project: JourneyProjectSpec;
}
