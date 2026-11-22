import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const TMP_DIR = path.join(ROOT, '.audit-sync-tmp');

function transpileFile(relSrcPath, relOutPath) {
  const fullSrc = path.join(ROOT, relSrcPath);
  const fullOut = path.join(TMP_DIR, relOutPath);
  const src = fs.readFileSync(fullSrc, 'utf8');
  const compiled = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const rewritten = compiled.replace(/require\((["'])@\/([^"']+)\1\)/g, (_m, q, p) => {
    return `require(${q}${path.join(TMP_DIR, p).replace(/\\/g, '/')}${q})`;
  });
  fs.mkdirSync(path.dirname(fullOut), { recursive: true });
  fs.writeFileSync(fullOut, rewritten, 'utf8');
  return fullOut;
}

function makeReq(url, init = {}) {
  const headers = new Headers(init.headers || {});
  const nextUrl = new URL(url, 'http://127.0.0.1:3000');
  return {
    headers,
    nextUrl,
    cookies: {
      get: () => undefined,
    },
    text: async () => (typeof init.body === 'string' ? init.body : ''),
    json: async () => JSON.parse(typeof init.body === 'string' ? init.body : '{}'),
  };
}

async function run() {
  process.env.SYNC_TEST_MODE = '1';
  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  const nextServerMockPath = path.join(TMP_DIR, 'next-server-mock.js');
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(
    nextServerMockPath,
    `exports.NextResponse = {
      json(body, init = {}) {
        return {
          status: init.status || 200,
          headers: new Headers(init.headers || {}),
          json: async () => body,
        };
      }
    };`,
    'utf8'
  );

  transpileFile('src/lib/syncValidation.ts', 'lib/syncValidation.js');
  transpileFile('src/lib/auth.ts', 'lib/auth.js');
  const routeOut = transpileFile('src/app/api/sync/route.ts', 'app/api/sync/route.js');
  const patchedRoute = fs
    .readFileSync(routeOut, 'utf8')
    .replace(/require\(["']next\/server["']\)/g, `require(${JSON.stringify(nextServerMockPath)})`);
  fs.writeFileSync(routeOut, patchedRoute, 'utf8');

  const {
    MAX_SYNC_PAYLOAD_BYTES,
    SlidingWindowLimiter,
    normalizeAndValidateSyncKey,
    validateCourseProgressPayload,
  } = require(path.join(TMP_DIR, 'lib/syncValidation.js'));
  const { GET, POST } = require(routeOut);

  // 1. Key sanitizer checks
  assert.equal(normalizeAndValidateSyncKey('short'), null);
  assert.equal(normalizeAndValidateSyncKey('aimc-valid-key-123456'), 'aimc-valid-key-123456');

  // 2. Schema validation checks
  assert.equal(validateCourseProgressPayload({ xp: 120, targetLevel: 'mid', completedLessons: ['1-0'] }).ok, true);
  assert.equal(validateCourseProgressPayload({ injectedField: 'evil' }).ok, false);
  assert.equal(validateCourseProgressPayload({ targetLevel: 'principal-wizard' }).ok, false);
  assert.equal(validateCourseProgressPayload({ xp: -5 }).ok, false);

  // 3. Sliding window limiter check
  const limiter = new SlidingWindowLimiter(2, 10_000);
  assert.equal(limiter.check('k1', 1000).allowed, true);
  assert.equal(limiter.check('k1', 2000).allowed, true);
  const blocked = limiter.check('k1', 3000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec >= 1);

  // 4. Reject GET query param ?key= without header
  const queryGet = await GET(makeReq('http://127.0.0.1:3000/api/sync?key=aimc-valid-key-123456', { headers: { 'x-forwarded-for': '10.0.0.1' } }));
  assert.equal(queryGet.status, 400);

  // 5. Reject malformed schema on POST with 400
  const badPost = await POST(
    makeReq('http://127.0.0.1:3000/api/sync', {
      headers: { 'x-forwarded-for': '10.0.0.2', 'x-sync-key': 'aimc-valid-key-123456' },
      body: JSON.stringify({ progress: { targetLevel: 'invalid' } }),
    })
  );
  assert.equal(badPost.status, 400);

  // 6. Reject oversized payload with 413
  const hugePost = await POST(
    makeReq('http://127.0.0.1:3000/api/sync', {
      headers: { 'x-forwarded-for': '10.0.0.3', 'x-sync-key': 'aimc-valid-key-123456' },
      body: JSON.stringify({ progress: { notes: { '1-0': 'a'.repeat(MAX_SYNC_PAYLOAD_BYTES + 10_000) } } }),
    })
  );
  assert.equal(hugePost.status, 413);

  // 7. Round-trip POST then GET via x-sync-key header
  const validKey = 'aimc-test-header-key-9999';
  const okPost = await POST(
    makeReq('http://127.0.0.1:3000/api/sync', {
      headers: { 'x-forwarded-for': '10.0.0.4', 'x-sync-key': validKey },
      body: JSON.stringify({ progress: { xp: 450, targetLevel: 'junior', completedLessons: ['0-1', '1-0'] } }),
    })
  );
  assert.equal(okPost.status, 200);

  const okGet = await GET(
    makeReq('http://127.0.0.1:3000/api/sync', {
      headers: { 'x-forwarded-for': '10.0.0.4', 'x-sync-key': validKey },
    })
  );
  assert.equal(okGet.status, 200);
  const okData = await okGet.json();
  assert.equal(okData.progress.xp, 450);
  assert.equal(okGet.headers.get('cache-control'), 'no-store');

  // 8. Rate-limit enforcement returns 429 on excessive bursts
  let saw429 = false;
  for (let i = 0; i < 40; i++) {
    const res = await GET(
      makeReq('http://127.0.0.1:3000/api/sync', {
        headers: { 'x-forwarded-for': '10.0.0.99', 'x-sync-key': validKey },
      })
    );
    if (res.status === 429) {
      saw429 = true;
      assert.ok(Number(res.headers.get('retry-after')) >= 1);
      break;
    }
  }
  assert.equal(saw429, true, 'Expected 429 rate-limit response on burst');

  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.log('SYNC API HARDENING TESTS: PASS (schema validation, header key, 413 payload limit, 200 round-trip, 429 rate-limit)');
}

run().catch((err) => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.error(err);
  process.exit(1);
});
