import { ALL_LESSONS, COURSE_MODULES } from './curriculum';
import type { CourseModule, QuizQuestion } from '@/types/course';

export interface TimedExamSpec {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  passScore: number;
  questions: QuizQuestion[];
}

export const PLACEMENT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'place-1',
    type: 'multiple-choice',
    question: 'Which terminal command activates a Python `.venv` created in the current directory on Linux/macOS and confirms it is active?',
    options: [
      '`source .venv/bin/activate && which python`',
      '`python --global-venv && cd .venv`',
      '`pip install --system .venv && ls`',
      '`git checkout .venv && python -V`',
    ],
    correctIndex: 0,
    explanation: '`source .venv/bin/activate` prepends `.venv/bin` onto `PATH`, and `which python` verifies the isolated interpreter is selected.',
  },
  {
    id: 'place-2',
    type: 'spot-bug',
    question: 'A teammate commits `.env` containing `OPENAI_API_KEY` to a public repo, then deletes `.env` in a follow-up `git rm .env` commit. Why is the key STILL compromised?',
    options: [
      'Git history permanently preserves earlier commit blobs; you must revoke & rotate the key immediately',
      'Because `.gitignore` automatically publishes deleted filenames on GitHub issue feeds',
      'Because `git rm` converts `.env` contents into base64 strings inside `README.md`',
      'Because Python automatically uploads all removed files to PyPI during `pip install`',
    ],
    correctIndex: 0,
    explanation: 'Any secret ever pushed in Git history stays readable forever; rotate/revoke at the provider immediately and scrub history.',
  },
  {
    id: 'place-3',
    type: 'predict-output',
    question: 'What is printed by calling `append_item("x")` followed by `append_item("y")` in Python?\n```python\ndef append_item(v, items=[]):\n    items.append(v)\n    return items\n```',
    options: [
      '`["x"]`, then `["x", "y"]` (mutable default leaks across calls)',
      '`["x"]`, then `["y"]`',
      '`["x", "y"]`, then `["x", "y"]`',
      'A `TypeError` because default parameters are immutable',
    ],
    correctIndex: 0,
    explanation: 'Default argument lists are allocated once at function `def` time; always default `items=None` and create `[]` inside.',
  },
  {
    id: 'place-4',
    type: 'multiple-choice',
    question: 'Which statement accurately contrasts a Python `dict` literal with strict `JSON`?',
    options: [
      'JSON mandates double-quoted keys/strings and lowercase `true`/`false`/`null` (`None` is invalid JSON)',
      'Python `dict` and JSON share 100% identical syntax including `True` and single quotes',
      'JSON forbids nested arrays while Python `dict` forbids integer values',
      'Python `dict` requires semicolons between entries while JSON uses colons',
    ],
    correctIndex: 0,
    explanation: 'Valid JSON (`json.dumps`) strictly enforces double quotes, lowercase booleans/null, and no trailing commas.',
  },
  {
    id: 'place-5',
    type: 'multiple-choice',
    question: 'Why does checking `chunk_id in seen_list` across `100,000` chunks slow down to seconds, and what replaces `list`?',
    options: [
      '`x in list` scans linearly (`O(n)` per lookup -> `O(n^2)` total); switch `seen` to a `set()` (`O(1)` lookup)',
      'Because Python `list` objects compress strings on every lookup using `zlib`',
      'Because tuples sort dynamically after every `.append()` call in Python 3.12',
      'Switching to nested `for` loops over string slices lowers time complexity to `O(log n)`',
    ],
    correctIndex: 0,
    explanation: 'Sets and dicts provide `O(1)` average hash membership checks (`O(n)` total runtime).',
  },
  {
    id: 'place-6',
    type: 'predict-output',
    question: 'In NumPy, `A` has shape `(32, 128)` and `b` has shape `(128,)`. What shape does `A - b` produce?',
    options: [
      '`(32, 128)` via trailing-dimension broadcasting',
      '`(128, 32)` transposed automatically',
      'Raises `ValueError` unless reshaped to `(32, 128)` manually',
      '`(1, 128)` collapsed across batch axis 0',
    ],
    correctIndex: 0,
    explanation: 'NumPy aligns shapes right-to-left (`128 == 128`) and broadcasts `(1, 128)` across all 32 rows.',
  },
  {
    id: 'place-7',
    type: 'multiple-choice',
    question: 'In a FastAPI endpoint calling synchronous `requests.post()`, why can declaring `async def ask()` hang all concurrent users?',
    options: [
      'Blocking synchronous I/O stalls the single-threaded `asyncio` event loop; await `httpx.AsyncClient` or use `def`',
      'Because `async def` forbids returning Python dictionaries as JSON responses',
      'Because FastAPI executes `async def` routes strictly inside browser WebAssembly workers',
      'Because synchronous libraries silently switch port 8000 to UDP sockets inside `async def`',
    ],
    correctIndex: 0,
    explanation: 'Use `await` with async HTTP clients inside `async def`, or plain `def` so AnyIO runs blocking code on its threadpool.',
  },
  {
    id: 'place-8',
    type: 'multiple-choice',
    question: 'How do you unit-test a Python service that calls paid HTTP APIs cleanly offline inside `pytest`?',
    options: [
      'Inject a mock/fake client interface (`monkeypatch` / dependency injection) with recorded deterministic responses',
      'Hardcode your personal billing key inside `test_api.py` and sleep 10 seconds per test',
      'Delete unit tests completely and verify only manually in Postman after deploys',
      'Disable `assert` statements whenever `CI=true` is detected in environment variables',
    ],
    correctIndex: 0,
    explanation: 'Dependency injection + `monkeypatch` fixtures keep unit tests sub-second, deterministic offline, and `$0`.',
  },
  {
    id: 'place-9',
    type: 'multiple-choice',
    question: 'In a Python `try / except` block parsing untrusted user payloads, why avoid bare `except Exception: pass`?',
    options: [
      'Swallowing all errors silently hides real programmer bugs (`TypeError`, `NameError`) and corrupts downstream state',
      'Because Python raises a `SyntaxError` unless at least three `except` clauses are present',
      'Because `pass` deletes local variables defined inside the `try` scope immediately',
      'Because catching `ValueError` consumes 10x more memory than catching `Exception`',
    ],
    correctIndex: 0,
    explanation: 'Catch specific expected exceptions, log context clearly, and emit explicit clean errors rather than swallowing bugs silently.',
  },
  {
    id: 'place-10',
    type: 'multiple-choice',
    question: 'What does `with open("config.json", encoding="utf-8") as f:` guarantee compared to `f = open(...); f.close()`?',
    options: [
      'Deterministic automatic closing of the file descriptor even if an exception occurs mid-block',
      'Automatic encryption of JSON secrets onto disk using AES-256',
      'Infinite caching of parsed dictionaries across multiple OS container restarts',
      'Automatic retry loops if `config.json` fails JSON schema validation',
    ],
    correctIndex: 0,
    explanation: 'Context managers guarantee deterministic resource cleanup via `__exit__` regardless of exceptions.',
  },
  {
    id: 'place-11',
    type: 'multiple-choice',
    question: 'Which `git` command creates AND switches immediately onto a new branch named `fix/rag-acl`?',
    options: [
      '`git checkout -b fix/rag-acl` (or `git switch -c fix/rag-acl`)',
      '`git branch --push fix/rag-acl`',
      '`git merge --init fix/rag-acl`',
      '`git commit -b fix/rag-acl`',
    ],
    correctIndex: 0,
    explanation: '`git switch -c` or `git checkout -b` creates a branch at HEAD and checks it out immediately.',
  },
  {
    id: 'place-12',
    type: 'multiple-choice',
    question: 'Why wrap dataclasses with `@dataclass` and Python type hints (`x: list[str]`) instead of passing raw untyped dicts everywhere?',
    options: [
      'Explicit schemas catch key typos early via static analysis and clarify contracts cleanly across modules',
      'Because `@dataclass` automatically compiles Python code down to native CUDA machine kernels',
      'Because Python dictionaries raise `RuntimeError` after storing more than 50 string keys',
      'Because type hints make JSON parsing 100x faster inside CPython bytecode',
    ],
    correctIndex: 0,
    explanation: 'Typed dataclasses document clear contracts across modules and help static checkers catch bugs before runtime.',
  },
];

export const PLACEMENT_EXAM: TimedExamSpec = {
  id: 'placement-fast-track',
  title: 'Developer Placement Test (Fast Track)',
  subtitle: 'Score 10 / 12 or higher to unlock the Fast Track for Developers—skipping beginner Terminal, Git & Python basics while focusing on Math, SQL, ML, LLMs, Software Engineering & Interviews.',
  durationMinutes: 12,
  passScore: 10,
  questions: PLACEMENT_QUESTIONS,
};

function normalizeQuestionForExam(q: QuizQuestion, fallbackId: string): QuizQuestion {
  // Ensure timed exam questions render reliably cleanly as single-choice or numeric/multi-select
  if (!q.type || q.type === 'multiple-choice' || q.type === 'predict-output' || q.type === 'spot-bug') {
    return { ...q, id: fallbackId };
  }
  return { ...q, id: fallbackId };
}

export function buildModuleExam(mod: CourseModule): TimedExamSpec {
  // Pull all single/mixed questions from this module's lessons, deterministically sampling up to 20
  const ownQs = mod.lessons.flatMap((l) => l.quiz.map((q) => normalizeQuestionForExam(q, `${mod.id}-${q.id}`)));
  const pool: QuizQuestion[] = [...ownQs];
  // Pad cleanly from adjacent module lessons only if module has < 20 questions (none of our 36-45 Q modules do!)
  if (pool.length < 20) {
    for (const l of ALL_LESSONS) {
      if (l.moduleId === mod.id) continue;
      for (const q of l.quiz) {
        if (pool.length >= 20) break;
        pool.push(normalizeQuestionForExam(q, `${mod.id}-pad-${q.id}`));
      }
      if (pool.length >= 20) break;
    }
  }
  // Pick 20 evenly distributed across lessons inside this module
  const picked: QuizQuestion[] = [];
  const step = Math.max(1, Math.floor(pool.length / 20));
  const used = new Set<number>();
  for (let i = 0; picked.length < 20 && i < pool.length; i += step) {
    picked.push(pool[i]);
    used.add(i);
  }
  for (let i = 0; picked.length < 20 && i < pool.length; i++) {
    if (!used.has(i)) picked.push(pool[i]);
  }
  return {
    id: mod.id,
    title: `Module ${mod.number} Mastery Exam: ${mod.title}`,
    subtitle: '20 timed questions spanning every lesson in this module. Score >= 14 / 20 (70%) to earn the Module Exam Mastery badge.',
    durationMinutes: 20,
    passScore: 14,
    questions: picked.slice(0, 20),
  };
}

export function buildFinalComprehensiveAssessment(): TimedExamSpec {
  // Pick 25 questions balanced across all 10 modules (2-3 per module)
  const picked: QuizQuestion[] = [];
  for (const mod of COURSE_MODULES) {
    const modQs = mod.lessons.flatMap((l) => l.quiz);
    const takeCount = mod.number >= 5 ? 3 : 2;
    for (let i = 0; i < takeCount && i < modQs.length; i++) {
      const idx = Math.floor((i * modQs.length) / takeCount);
      const q = modQs[idx];
      picked.push(normalizeQuestionForExam(q, `final-${mod.id}-${q.id}`));
    }
  }
  const finalQs = picked.slice(0, 25);
  return {
    id: 'final-assessment',
    title: 'Comprehensive AI Engineer Final Assessment',
    subtitle: '25 timed questions covering Terminal/Git, Python, Math/Stats, pandas/SQL, ML, Deep Learning/Transformers, LLM APIs/RAG, Agents/Evals, Production SwEng & Interviews. Pass >= 18 / 25 (72%).',
    durationMinutes: 30,
    passScore: 18,
    questions: finalQs,
  };
}
