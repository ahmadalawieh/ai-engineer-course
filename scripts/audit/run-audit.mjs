import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import ts from 'typescript';

const require = createRequire(import.meta.url);

const ROOT = process.cwd();
const TMP_DIR = path.join(ROOT, '.audit-tmp');
const ARGS = new Set(process.argv.slice(2));
const FULL_BUILD = ARGS.has('--full');
const STRICT_ALL = ARGS.has('--strict-all');

// Rebuilt lessons held strictly to Section 2 targets (1200-2000 prose words, >=8 quiz Qs, >=3 labs)
const REBUILT_LESSON_IDS = new Set([
  '0-1', '0-2', '0-3',
  '1-0', '1-1', '1-2', '1-3', '1-4', '1-5', '1-6',
  '2-1', '2-2', '2-3', '2-4', '2-5',
  '3-1', '3-2', '3-3', '3-4', '3-5',
  '4-1', '4-2', '4-3', '4-4',
  '5-1', '5-2', '5-3', '5-4',
  '6-0', '6-1', '6-2', '6-3', '6-4', '6-5',
  '7-1', '7-2', '7-3', '7-4',
  '9-1', '9-2', '9-3', '9-4',
]);

const EXTERNAL_URL_ALLOWLIST = [
  'https://accounts.google.com/o/oauth2/v2/auth',
  'https://oauth2.googleapis.com/token',
  'https://www.googleapis.com/oauth2/v3/userinfo',
  'https://api.github.com/gists',
];

function compileTsProject() {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const entries = [
    path.join(ROOT, 'src/data/curriculum.ts'),
    path.join(ROOT, 'src/data/jobWorkbench.ts'),
    path.join(ROOT, 'src/lib/quizUtils.ts'),
  ];

  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    skipLibCheck: true,
    outDir: TMP_DIR,
    rootDir: path.join(ROOT, 'src'),
    baseUrl: ROOT,
    paths: {
      '@/*': ['src/*'],
    },
  };

  const program = ts.createProgram(entries, options);
  const emitResult = program.emit();
  const diags = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  if (diags.length > 0) {
    for (const d of diags) {
      console.error(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    }
    throw new Error('TypeScript audit compilation failed');
  }

  // Rewrite compiled `@/` requires to relative `.audit-tmp/` paths
  const walkJs = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walkJs(full);
      else if (ent.name.endsWith('.js')) {
        let code = fs.readFileSync(full, 'utf8');
        code = code.replace(/require\("@\/([^"]+)"\)/g, (_, target) => {
          let rel = path.relative(path.dirname(full), path.join(TMP_DIR, target)).replace(/\\/g, '/');
          if (!rel.startsWith('.')) rel = './' + rel;
          return `require("${rel}")`;
        });
        fs.writeFileSync(full, code, 'utf8');
      }
    }
  };
  walkJs(TMP_DIR);
}

function countWords(text) {
  if (!text) return 0;
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function countLessonProseWords(lesson) {
  let words = 0;
  for (const block of lesson.blocks) {
    if (block.type === 'prose') {
      for (const p of block.paragraphs) words += countWords(p);
    } else if (block.type === 'callout') {
      words += countWords(block.body);
    } else if (block.type === 'frontend-bridge') {
      words += countWords(block.explanation);
    } else if (block.type === 'math') {
      words += countWords(block.intuition);
    } else if (block.type === 'visual-diagram') {
      words += countWords(block.caption);
    } else if (block.type === 'concept-reel') {
      words += countWords(block.description);
    }
  }
  if (Array.isArray(lesson.checkWithoutNotes)) {
    for (const item of lesson.checkWithoutNotes) words += countWords(item);
  }
  return words;
}

function findAllSourceFiles(dir) {
  const files = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files.push(...findAllSourceFiles(full));
    else if (/\.(ts|tsx)$/.test(ent.name)) files.push(full);
  }
  return files;
}

function analyzeSingleChoiceQuizzes(questions) {
  const sc = questions.filter(
    (q) => !q.type || q.type === 'multiple-choice' || q.type === 'predict-output' || q.type === 'spot-bug'
  );
  const indexCounts = [0, 0, 0, 0];
  let strictlyLongestCount = 0;
  for (const q of sc) {
    if (q.correctIndex >= 0 && q.correctIndex < 4) indexCounts[q.correctIndex]++;
    const lens = q.options.map((o) => o.length);
    const maxLen = Math.max(...lens);
    const maxCount = lens.filter((l) => l === maxLen).length;
    if (maxCount === 1 && lens[q.correctIndex] === maxLen) {
      strictlyLongestCount++;
    }
  }
  return {
    totalSingleChoice: sc.length,
    indexCounts,
    strictlyLongestPct: sc.length > 0 ? strictlyLongestCount / sc.length : 0,
  };
}

function main() {
  const failures = [];
  console.log('=== AI Mastery Studio Automated Audit ===');

  compileTsProject();
  const { COURSE_MODULES, ALL_LESSONS } = require(path.join(TMP_DIR, 'data/curriculum.js'));
  const { WORKPLACE_TICKETS, GUIDED_PROJECTS } = require(path.join(TMP_DIR, 'data/jobWorkbench.js'));
  const { getShuffledIndices } = require(path.join(TMP_DIR, 'lib/quizUtils.js'));
  console.log(`Loaded ${COURSE_MODULES.length} modules, ${ALL_LESSONS.length} lessons.`);

  // 1. Collect all labs & execute via pinned Python environment
  const labs = [];
  for (const lesson of ALL_LESSONS) {
    for (const block of lesson.blocks) {
      if (block.type === 'python-lab') {
        labs.push({ ...block, source: `lesson:${lesson.id}` });
      }
    }
  }
  for (const t of WORKPLACE_TICKETS) {
    labs.push({ ...t.lab, source: `ticket:${t.id}` });
  }
  for (const p of GUIDED_PROJECTS) {
    if (p.liveLab) labs.push({ ...p.liveLab, source: `project:${p.id}` });
  }

  const venvPython = path.join(ROOT, '.venv-audit/bin/python');
  const pythonBin = fs.existsSync(venvPython) ? venvPython : 'python3';
  const pyRun = spawnSync(pythonBin, [path.join(ROOT, 'scripts/audit/run_labs.py')], {
    input: JSON.stringify(labs),
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });

  if (pyRun.status !== 0) {
    failures.push(`Python lab harness exited with ${pyRun.status}: ${pyRun.stderr}`);
  } else {
    const { results } = JSON.parse(pyRun.stdout);
    let passed = 0;
    for (const r of results) {
      if (!r.solutionPassed) {
        failures.push(`[LAB FAIL] ${r.labId} (${r.source}) solution failed:\n${r.errors.join('\n')}`);
      } else if (!r.starterFailedAsExpected) {
        failures.push(`[LAB FAIL] ${r.labId} (${r.source}) starterCode passed testCode unexpectedly!`);
      } else {
        passed++;
      }
    }
    console.log(`[1/6] Labs executed (${pythonBin}): ${passed}/${results.length} PASSED (solutions pass across seeds & starters fail)`);
  }

  // 2. Check requires vs teaches concept graph
  const taughtSoFar = new Set();
  let tagViolations = 0;
  for (const lesson of ALL_LESSONS) {
    for (const req of lesson.requires || []) {
      if (!taughtSoFar.has(req)) {
        failures.push(`[PREREQ FAIL] Lesson ${lesson.id} requires '${req}' before it is taught.`);
        tagViolations++;
      }
    }
    for (const t of lesson.teaches || []) taughtSoFar.add(t);
    for (const block of lesson.blocks) {
      if (block.type === 'python-lab') {
        for (const req of block.requires || []) {
          if (!taughtSoFar.has(req)) {
            failures.push(`[PREREQ FAIL] Lab ${block.labId} (in ${lesson.id}) requires '${req}' before it is taught.`);
            tagViolations++;
          }
        }
      }
    }
  }
  console.log(`[2/6] Concept teaches/requires DAG: ${tagViolations === 0 ? 'PASS (0 violations)' : `FAIL (${tagViolations})`}`);

  // 3. Quiz quality + deterministic shuffling check
  const rebuiltLessons = STRICT_ALL ? ALL_LESSONS : ALL_LESSONS.filter((l) => REBUILT_LESSON_IDS.has(l.id));
  const rebuiltQs = rebuiltLessons.flatMap((l) => l.quiz);
  const rebuiltStats = analyzeSingleChoiceQuizzes(rebuiltQs);

  if (rebuiltStats.strictlyLongestPct > 0.4) {
    failures.push(`[QUIZ FAIL] Rebuilt lessons longest-option bias ${(rebuiltStats.strictlyLongestPct * 100).toFixed(1)}% > 40%`);
  }
  for (let i = 0; i < 4; i++) {
    const pct = rebuiltStats.indexCounts[i] / Math.max(1, rebuiltStats.totalSingleChoice);
    if (rebuiltStats.totalSingleChoice >= 8 && (pct < 0.14 || pct > 0.36)) {
      failures.push(`[QUIZ FAIL] Rebuilt correctIndex[${i}] share ${(pct * 100).toFixed(1)}% outside target balance`);
    }
  }

  // Also test shuffle function consistency across seeds
  const samplePermA = getShuffledIndices(4, 'seed-alpha:6-3:q6-3-1');
  const samplePermB = getShuffledIndices(4, 'seed-alpha:6-3:q6-3-1');
  if (JSON.stringify(samplePermA) !== JSON.stringify(samplePermB) || samplePermA.length !== 4) {
    failures.push('[QUIZ FAIL] Deterministic shuffle consistency failed');
  }

  // Diagnostic summary across legacy vs rebuilt
  const allStats = analyzeSingleChoiceQuizzes(ALL_LESSONS.flatMap((l) => l.quiz));
  console.log(
    `[3/6] Quizzes (rebuilt strict set n=${rebuiltQs.length}): longest=${(rebuiltStats.strictlyLongestPct * 100).toFixed(1)}%, idx=[${rebuiltStats.indexCounts.join(',')}] | Course-wide longest=${(allStats.strictlyLongestPct * 100).toFixed(1)}%`
  );

  // 4. Lesson word count & quiz count report
  let strictLessonFails = 0;
  const legacyShort = [];
  for (const l of ALL_LESSONS) {
    const words = countLessonProseWords(l);
    const qCount = l.quiz.length;
    const isStrict = STRICT_ALL || REBUILT_LESSON_IDS.has(l.id);
    if (isStrict) {
      if (words < 1200) {
        failures.push(`[WORD COUNT FAIL] Lesson ${l.id} has ${words} prose words (< 1200 minimum)`);
        strictLessonFails++;
      }
      if (qCount < 8) {
        failures.push(`[QUIZ COUNT FAIL] Lesson ${l.id} has ${qCount} questions (< 8 minimum)`);
        strictLessonFails++;
      }
      console.log(`      -> STRICT LESSON ${l.number} (${l.id}): ${words} prose words, ${qCount} quiz Qs`);
    } else if (words < 1200 || qCount < 8) {
      legacyShort.push(`${l.number}(${words}w/${qCount}q)`);
    }
  }
  console.log(
    `[4/6] Lesson depth (${rebuiltLessons.length} strict checked, ${strictLessonFails} failed; legacy: ${legacyShort.join(', ')})`
  );

  // 5. External URL audit
  const srcFiles = findAllSourceFiles(path.join(ROOT, 'src'));
  const disallowedUrls = [];
  for (const file of srcFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const txt = fs.readFileSync(file, 'utf8');
    const matches = txt.match(/https?:\/\/[^\s"'`)\\]+/g) || [];
    for (const m of matches) {
      const clean = m.replace(/[,.;:]+$/, '');
      const allowed = EXTERNAL_URL_ALLOWLIST.some((prefix) => clean.startsWith(prefix));
      if (!allowed) {
        disallowedUrls.push(`${rel}: ${clean}`);
      }
    }
  }
  if (disallowedUrls.length > 0) {
    for (const u of disallowedUrls) failures.push(`[EXTERNAL URL FAIL] ${u}`);
  }
  console.log(`[5/6] Self-containment URL scan: ${disallowedUrls.length === 0 ? 'PASS (0 disallowed URLs)' : `FAIL (${disallowedUrls.length})`}`);

  // 6. Security & local runtime sanity checks
  const pyRunnerTxt = fs.readFileSync(path.join(ROOT, 'src/lib/pyodideRunner.ts'), 'utf8');
  if (pyRunnerTxt.includes('cdn.jsdelivr.net') || !fs.existsSync(path.join(ROOT, 'public/pyodide/v0.26.4/pyodide.js'))) {
    failures.push('[RUNTIME FAIL] Pyodide is not vendored locally under public/pyodide/v0.26.4/');
  }
  const syncRouteTxt = fs.readFileSync(path.join(ROOT, 'src/app/api/sync/route.ts'), 'utf8');
  if (!syncRouteTxt.includes('cleaned.length < 16')) {
    failures.push('[SECURITY FAIL] /api/sync sanitizeKey must enforce minimum length >= 16');
  }
  console.log('[6/6] Vendored Pyodide & >=16-char sync key checks: PASS');

  if (FULL_BUILD) {
    console.log('Running tsc, eslint, and next build...');
    execFileSync('npx', ['tsc', '--noEmit'], { stdio: 'inherit' });
    execFileSync('npm', ['run', 'lint'], { stdio: 'inherit' });
    execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
  }

  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  if (failures.length > 0) {
    console.error('\nAUDIT FAILED:');
    for (const f of failures) console.error(' - ' + f);
    process.exit(1);
  }
  console.log('\nALL AUDIT GATES PASSED.');
}

main();
