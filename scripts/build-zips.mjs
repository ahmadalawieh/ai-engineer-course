#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = path.resolve(process.cwd());
const TMP_DIR = path.join(ROOT, '.tmp-zips');
const OUT_DIR = path.join(ROOT, 'public/capstones');

// Minimal pure-Node RFC 1951/ZIP archive writer (stored/deflate with standard CRC-32)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipBuffer(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const rawBuf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
    const crc = crc32(rawBuf);
    const compressed = zlib.deflateRawSync(rawBuf);

    // Local file header (30 bytes + name)
    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4); // version needed
    lfh.writeUInt16LE(0x0800, 6); // UTF-8 flag
    lfh.writeUInt16LE(8, 8); // deflate
    lfh.writeUInt16LE(0, 10);
    lfh.writeUInt16LE(0, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compressed.length, 18);
    lfh.writeUInt32LE(rawBuf.length, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);

    localParts.push(lfh, nameBuf, compressed);

    // Central directory header (46 bytes + name)
    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(0x0800, 8);
    cdh.writeUInt16LE(8, 10);
    cdh.writeUInt16LE(0, 12);
    cdh.writeUInt16LE(0, 14);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(compressed.length, 20);
    cdh.writeUInt32LE(rawBuf.length, 24);
    cdh.writeUInt16LE(nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);
    cdh.writeUInt16LE(0, 32);
    cdh.writeUInt16LE(0, 34);
    cdh.writeUInt16LE(0, 36);
    cdh.writeUInt32LE(0, 38);
    cdh.writeUInt32LE(offset, 42);

    centralParts.push(cdh, nameBuf);
    offset += lfh.length + nameBuf.length + compressed.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuf, eocd]);
}

function compileWorkbench() {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const program = ts.createProgram(
    [path.join(ROOT, 'src/data/jobWorkbench.ts')],
    {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      outDir: TMP_DIR,
      rootDir: path.join(ROOT, 'src'),
      paths: { '@/*': [path.join(ROOT, 'src/*')] },
    }
  );
  const res = program.emit();
  const diags = ts.getPreEmitDiagnostics(program).concat(res.diagnostics);
  if (diags.length > 0) {
    for (const d of diags) {
      console.error(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    }
    throw new Error('Failed compiling jobWorkbench.ts for zip export');
  }
}

function main() {
  compileWorkbench();
  const { GUIDED_PROJECTS } = require(path.join(TMP_DIR, 'data/jobWorkbench.js'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const proj of GUIDED_PROJECTS) {
    const prefix = `${proj.id}/`;
    const fileMap = new Map();
    for (const f of proj.files) {
      fileMap.set(`${prefix}${f.filename}`, f.content);
    }
    if (!fileMap.has(`${prefix}DEPLOY.md`) && proj.deploymentGuide) {
      fileMap.set(`${prefix}DEPLOY.md`, `# Deployment Guide — ${proj.title}\n\n${proj.deploymentGuide}\n`);
    }
    if (!fileMap.has(`${prefix}RUBRIC.md`) && proj.gradingRubric) {
      const rows = proj.gradingRubric.map((r) => `| ${r.criterion} | ${r.weight} | ${r.passBar} |`).join('\n');
      fileMap.set(`${prefix}RUBRIC.md`, `# Grading Rubric — ${proj.title}\n\n| Criterion | Weight | Pass Standard |\n|---|---|---|\n${rows}\n`);
    }
    if (!fileMap.has(`${prefix}JOURNAL.md`) && proj.journalTemplate) {
      fileMap.set(`${prefix}JOURNAL.md`, proj.journalTemplate);
    }

    const entries = Array.from(fileMap.entries()).map(([name, data]) => ({ name, data }));
    const zipBuf = createZipBuffer(entries);
    const outPath = path.join(OUT_DIR, `${proj.id}.zip`);
    fs.writeFileSync(outPath, zipBuf);
    console.log(`Built ${path.relative(ROOT, outPath)} (${entries.length} files, ${zipBuf.length} bytes)`);
  }

  fs.rmSync(TMP_DIR, { recursive: true, force: true });
}

main();
