export type PhaseId = 'phase-0' | 'system-1' | 'system-2' | 'system-3' | 'system-4';

export interface StudioTicket {
  id: string;
  phaseId: PhaseId;
  code: string;
  roleContext: string;
  title: string;
  leadQuote: string;
  timeMinutes: number;
  stackTag: string;
  xp: number;
  acceptanceCriteria: [string, string, string];
  flowSteps: [string, string, string];
  cheatSheet: {
    title: string;
    code: string;
    tip: string;
  };
  language: 'python' | 'sql';
  setupCode?: string;
  starterCode: string;
  solutionCode: string;
  testCode: string;
}

export interface StudioSystemRepo {
  repoId: string;
  title: string;
  clientScenario: string;
  stack: string;
  zipUrl: string;
  localCommands: string[];
  deliverables: [string, string, string];
}

export interface StudioPhase {
  id: PhaseId;
  shortLabel: string;
  title: string;
  roleBadge: string;
  summary: string;
  repo?: StudioSystemRepo;
}
