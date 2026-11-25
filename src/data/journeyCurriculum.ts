import type { JourneyLesson, JourneyStage } from '@/types/journey';
import { STAGE_1_TO_3_LESSONS } from './stages/stage1to3';
import { STAGE_4_TO_7_LESSONS } from './stages/stage4to7';

export const ALL_JOURNEY_LESSONS: JourneyLesson[] = [
  ...STAGE_1_TO_3_LESSONS,
  ...STAGE_4_TO_7_LESSONS,
];

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    stageNumber: 1,
    shortTitle: 'Stage 1: Setup & Python Basics',
    title: 'Computer Setup & First Steps in Python',
    goal: 'Install VS Code, Python & Git on your PC and write your first real calculation scripts from zero.',
    project: {
      id: 'project-1-quote-cli',
      stageNumber: 1,
      title: 'Project 1: Freelance Quote & Invoice Calculator',
      tagline: 'Your very first `.py` program running in VS Code on your computer.',
      whatYouBuild:
        'An interactive terminal script that asks for client name, hours, and rush status, applies VIP discounts, adds tax, and prints a clean quote.',
      skillsUsed: ['VS Code & Terminal', 'Variables & Math', 'f-strings', 'if / else'],
      zipUrl: '/capstones/project-1-quote-cli.zip',
      winQuickstart: ['cd project-1-quote-cli', 'python quote_tool.py'],
      macQuickstart: ['cd project-1-quote-cli', 'python3 quote_tool.py'],
    },
  },
  {
    stageNumber: 2,
    shortTitle: 'Stage 2: Python for Real Data',
    title: 'Lists, JSON Dictionaries, Functions & Files',
    goal: 'Process batches of messy customer records without crashing when fields are missing or malformed.',
    project: {
      id: 'project-2-lead-cleaner',
      stageNumber: 2,
      title: 'Project 2: Automated Messy Lead & JSON Cleaner',
      tagline: 'Reads raw form submissions from disk, cleans & filters invalid leads, and exports clean JSON.',
      whatYouBuild:
        'A reusable Python data-cleaning tool using loops, `.get()` defaults, `def` functions, `try/except`, and `.json` file reading/writing.',
      skillsUsed: ['Lists & for Loops', 'Dictionaries & JSON', 'def Functions', 'try / except'],
      zipUrl: '/capstones/project-2-lead-cleaner.zip',
      winQuickstart: ['cd project-2-lead-cleaner', 'python clean_leads.py'],
      macQuickstart: ['cd project-2-lead-cleaner', 'python3 clean_leads.py'],
    },
  },
  {
    stageNumber: 3,
    shortTitle: 'Stage 3: APIs, First AI & GitHub',
    title: 'Virtual Environments, APIs, Structured AI & Git',
    goal: 'Set up `.venv` & `.env`, call Gemini/OpenAI for strict JSON extraction, and push your first GitHub repo.',
    project: {
      id: 'project-3-ai-extractor',
      stageNumber: 3,
      title: 'Project 3: AI Email & Invoice JSON Extractor',
      tagline: 'Your first GitHub repository—extracts vendor, invoice number, and verified totals from messy emails.',
      whatYouBuild:
        'A clean Python project with `.venv`, `.env`, `.gitignore`, offline mock + live Gemini API mode, and math/confidence verification.',
      skillsUsed: ['.venv & pip', '.env Secrets', 'Structured AI JSON', 'Git & GitHub'],
      zipUrl: '/capstones/doc-ops-extractor.zip',
      winQuickstart: [
        'cd doc-ops-extractor',
        'python -m venv .venv',
        '.venv\\Scripts\\activate',
        'pip install -r requirements.txt',
        'python validator.py',
      ],
      macQuickstart: [
        'cd doc-ops-extractor',
        'python3 -m venv .venv && source .venv/bin/activate',
        'pip install -r requirements.txt && python3 validator.py',
      ],
    },
  },
  {
    stageNumber: 4,
    shortTitle: 'Stage 4: Python + SQL + HTML/CSS',
    title: 'Web Backends: FastAPI, SQL & Your HTML/CSS Frontend',
    goal: 'Connect your HTML/CSS skills and SQL knowledge to a live Python FastAPI backend.',
    project: {
      id: 'project-4-support-webapp',
      stageNumber: 4,
      title: 'Project 4: Full-Stack AI Order & Support Web App',
      tagline: 'A complete local web app: HTML/CSS chat UI + FastAPI + SQLite `orders` table + grounded AI replies.',
      whatYouBuild:
        'A full-stack customer portal at `http://localhost:8000` that looks up real order rows in SQL and writes accurate customer answers.',
      skillsUsed: ['FastAPI', 'SQLite / SQL', 'HTML/CSS fetch()', 'Grounded Prompts'],
      zipUrl: '/capstones/project-4-support-webapp.zip',
      winQuickstart: [
        'cd project-4-support-webapp',
        'python -m venv .venv && .venv\\Scripts\\activate',
        'pip install -r requirements.txt',
        'uvicorn main:app --reload',
      ],
      macQuickstart: [
        'cd project-4-support-webapp',
        'python3 -m venv .venv && source .venv/bin/activate',
        'pip install -r requirements.txt && uvicorn main:app --reload',
      ],
    },
  },
  {
    stageNumber: 5,
    shortTitle: 'Stage 5: Private Company RAG',
    title: 'Teaching AI Private Company Docs & Permissions',
    goal: 'Search company handbooks + exact SKU codes with citations and strict multi-company privacy.',
    project: {
      id: 'tenant-rag-copilot',
      stageNumber: 5,
      title: 'Project 5: Multi-Customer Company Knowledge Copilot',
      tagline: 'Permission-aware Hybrid RAG with source citations and zero cross-company leaks.',
      whatYouBuild:
        'A FastAPI RAG service enforcing `company_id` + role filtering before search, citation verification, and safe abstention.',
      skillsUsed: ['Document Chunking', 'Hybrid Search', 'Source Citations', 'Multi-Tenant Privacy'],
      zipUrl: '/capstones/tenant-rag-copilot.zip',
      winQuickstart: [
        'cd tenant-rag-copilot',
        'python -m venv .venv && .venv\\Scripts\\activate',
        'pip install -r requirements.txt',
        'python validator.py',
      ],
      macQuickstart: [
        'cd tenant-rag-copilot',
        'python3 -m venv .venv && source .venv/bin/activate',
        'pip install -r requirements.txt && python3 validator.py',
      ],
    },
  },
  {
    stageNumber: 6,
    shortTitle: 'Stage 6: Safe Action Agents',
    title: 'AI Agents With Python Tools, MCP & Human Approval',
    goal: 'Equip AI to call safe lookup tools, stop infinite loops, prevent duplicate charges, and pause >$50 actions.',
    project: {
      id: 'ops-workflow-agent',
      stageNumber: 6,
      title: 'Project 6: Operations Agent with Manager Approval Queue',
      tagline: 'Investigates tickets with tools, prevents duplicate refunds, and gates >$50 refunds for human approval.',
      whatYouBuild:
        'An operations agent service with role-scoped MCP tool discovery, step limits, idempotency receipts, and HITL checkpoints.',
      skillsUsed: ['Tool Calling', 'MCP Servers', 'Loop & Duplicate Brakes', 'Human-in-the-Loop'],
      zipUrl: '/capstones/ops-workflow-agent.zip',
      winQuickstart: [
        'cd ops-workflow-agent',
        'python -m venv .venv && .venv\\Scripts\\activate',
        'pip install -r requirements.txt',
        'python validator.py',
      ],
      macQuickstart: [
        'cd ops-workflow-agent',
        'python3 -m venv .venv && source .venv/bin/activate',
        'pip install -r requirements.txt && python3 validator.py',
      ],
    },
  },
  {
    stageNumber: 7,
    shortTitle: 'Stage 7: Ship Live & Get Hired',
    title: 'Streaming, Auto-Testing, Cloud Deploy & Hiring Playbook',
    goal: 'Add privacy scrubbing, `pytest` regression suites, daily spend caps, and deploy live to an `https://` URL.',
    project: {
      id: 'ai-prod-gateway',
      stageNumber: 7,
      title: 'Project 7 (Capstone): Deployed Production AI Gateway',
      tagline: 'Your Mid-Level hiring centerpiece—PII scrubbing, prompt-hack firewall, model routing, $ caps & Dockerfile.',
      whatYouBuild:
        'A deploy-ready FastAPI AI gateway with `Dockerfile`, automated `pytest` security/budget suite, and `evidence.json` proof.',
      skillsUsed: ['SSE Streaming', 'PII & Injection Guard', 'pytest CI Evals', 'Cloud Deploy & ROI'],
      zipUrl: '/capstones/ai-prod-gateway.zip',
      winQuickstart: [
        'cd ai-prod-gateway',
        'python -m venv .venv && .venv\\Scripts\\activate',
        'pip install -r requirements.txt',
        'python validator.py',
      ],
      macQuickstart: [
        'cd ai-prod-gateway',
        'python3 -m venv .venv && source .venv/bin/activate',
        'pip install -r requirements.txt && python3 validator.py',
      ],
    },
  },
];

export function getStageLessons(stageNumber: number): JourneyLesson[] {
  return ALL_JOURNEY_LESSONS.filter((l) => l.stageNumber === stageNumber);
}

export function getJourneyLessonById(id: string): JourneyLesson | undefined {
  return ALL_JOURNEY_LESSONS.find((l) => l.id === id);
}
