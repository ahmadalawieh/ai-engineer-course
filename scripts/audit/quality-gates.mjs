import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FORBIDDEN_MODEL_REGEX = /\b(gpt-4o-mini|gpt-4o|llama-3|text-embedding-3)\b/gi;

function loadCompetencies(rootDir, tmpDir) {
  const levelsSrcPath = path.join(rootDir, 'src/data/levels.ts');
  const src = fs.readFileSync(levelsSrcPath, 'utf8');
  const compiled = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const rewritten = compiled.replace(/require\((["'])@\/([^"']+)\1\)/g, (_m, q, p) => {
    return `require(${q}${path.join(tmpDir, p).replace(/\\/g, '/')}${q})`;
  });
  const outPath = path.join(tmpDir, 'data/levels.js');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rewritten, 'utf8');
  delete require.cache[outPath];
  const mod = require(outPath);
  return mod.COMPETENCIES || [];
}

function parseIsoDay(isoStr) {
  if (!isoStr || typeof isoStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr.trim())) {
    return null;
  }
  const ts = Date.parse(`${isoStr.trim()}T00:00:00Z`);
  return Number.isNaN(ts) ? null : ts;
}

function walkTsFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkTsFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Verifies:
 * 1) Every ai-eng lesson has valid competencies, fresh lastReviewed, failure discussion, and >=1 table block.
 * 2) MODEL_CATALOG entries pass lastReviewed freshness check.
 * 3) Zero hardcoded legacy model names outside src/data/modelCatalog.ts.
 */
export function runQualityGates({ rootDir, tmpDir, lessons, modelCatalog, competencies, referenceDateIso }) {
  const failures = [];
  const warnings = [];
  const refTs = parseIsoDay(referenceDateIso) ?? Date.now();
  const compList = competencies && competencies.length > 0 ? competencies : loadCompetencies(rootDir, tmpDir);
  const validCompIds = new Set(compList.map((c) => c.id));

  let aiEngChecked = 0;
  for (const lesson of lessons) {
    if (lesson.track !== 'ai-eng') continue;
    aiEngChecked += 1;

    // 1. Competencies check
    if (!Array.isArray(lesson.competencies) || lesson.competencies.length === 0) {
      failures.push(`[QUALITY FAIL] ai-eng lesson ${lesson.id} is missing non-empty competencies[]`);
    } else {
      for (const cid of lesson.competencies) {
        if (!validCompIds.has(cid)) {
          failures.push(`[QUALITY FAIL] lesson ${lesson.id} references unknown competency '${cid}'`);
        }
      }
    }

    // 2. lastReviewed freshness
    const revTs = parseIsoDay(lesson.lastReviewed);
    if (revTs === null) {
      failures.push(`[FRESHNESS FAIL] ai-eng lesson ${lesson.id} has missing or invalid lastReviewed date`);
    } else {
      const ageDays = Math.floor((refTs - revTs) / MS_PER_DAY);
      if (ageDays > 365) {
        failures.push(`[FRESHNESS FAIL] lesson ${lesson.id} lastReviewed (${lesson.lastReviewed}) is ${ageDays}d old (>365d)`);
      } else if (ageDays > 180) {
        warnings.push(`[FRESHNESS WARN] lesson ${lesson.id} lastReviewed (${lesson.lastReviewed}) is ${ageDays}d old (>180d)`);
      }
    }

    // 3. Failure/mistake discussion check
    const proseText = (lesson.blocks || [])
      .filter((b) => b.type === 'prose' || b.type === 'callout')
      .map((b) => `${b.heading || ''} ${b.title || ''} ${b.body || ''} ${(b.paragraphs || []).join(' ')}`)
      .join(' ')
      .toLowerCase();
    if (!/(mistake|debug|fail|pitfall|anti-pattern|leak|injection|bug|regression|error)/.test(proseText)) {
      failures.push(`[QUALITY FAIL] ai-eng lesson ${lesson.id} lacks explicit failure/mistake/debugging analysis`);
    }

    // 4. Trade-off table check
    const hasTable = (lesson.blocks || []).some((b) => b.type === 'table' && Array.isArray(b.rows) && b.rows.length > 0);
    if (!hasTable) {
      failures.push(`[QUALITY FAIL] ai-eng lesson ${lesson.id} is missing a trade-off comparison 'table' block`);
    }
  }

  // 5. MODEL_CATALOG freshness
  let catalogChecked = 0;
  for (const entry of modelCatalog || []) {
    catalogChecked += 1;
    const revTs = parseIsoDay(entry.lastReviewed);
    if (revTs === null) {
      failures.push(`[CATALOG FAIL] MODEL_CATALOG role '${entry.roleId}' has missing/invalid lastReviewed`);
    } else {
      const ageDays = Math.floor((refTs - revTs) / MS_PER_DAY);
      if (ageDays > 365) {
        failures.push(`[CATALOG FAIL] MODEL_CATALOG role '${entry.roleId}' lastReviewed (${entry.lastReviewed}) is ${ageDays}d old (>365d)`);
      } else if (ageDays > 180) {
        warnings.push(`[CATALOG WARN] MODEL_CATALOG role '${entry.roleId}' lastReviewed (${entry.lastReviewed}) is ${ageDays}d old (>180d)`);
      }
    }
  }

  // 6. Zero forbidden hardcoded model names outside src/data/modelCatalog.ts
  const srcFiles = walkTsFiles(path.join(rootDir, 'src'));
  const catalogPath = path.resolve(rootDir, 'src/data/modelCatalog.ts');
  for (const file of srcFiles) {
    if (path.resolve(file) === catalogPath) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const matches = raw.match(FORBIDDEN_MODEL_REGEX);
    if (matches && matches.length > 0) {
      const rel = path.relative(rootDir, file);
      failures.push(`[HYGIENE FAIL] Hardcoded legacy model token(s) [${[...new Set(matches)].join(', ')}] in ${rel}; reference MODEL_CATALOG roles instead.`);
    }
  }

  return {
    aiEngChecked,
    catalogChecked,
    failures,
    warnings,
  };
}
