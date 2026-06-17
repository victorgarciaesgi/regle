#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const catalogFiles = [
  'packages/core/src/diagnostics/runtime.ts',
  'packages/core/src/diagnostics/devtools.ts',
  'packages/rules/src/diagnostics/rules.ts',
  'packages/schemas/src/diagnostics/schema.ts',
  'packages/nuxt/src/diagnostics/nuxt.ts',
];

const codePattern = /REGLE_[RCD]\d{4}/g;

function codeToSlug(code) {
  return code.replace('REGLE_', '').toLowerCase();
}

async function collectCatalogCodes() {
  const codes = new Set();
  for (const file of catalogFiles) {
    const content = await readFile(join(root, file), 'utf8');
    for (const match of content.matchAll(codePattern)) {
      codes.add(match[0]);
    }
  }
  return [...codes].sort();
}

async function collectDocSlugs() {
  const errorsDir = join(root, 'docs/src/errors');
  const entries = await readdir(errorsDir);
  return entries.filter((f) => f.endsWith('.md') && f !== 'index.md').map((f) => f.replace(/\.md$/, ''));
}

const codes = await collectCatalogCodes();
const slugs = await collectDocSlugs();
const expectedSlugs = codes.map(codeToSlug);

const missing = expectedSlugs.filter((slug) => !slugs.includes(slug));
const orphan = slugs.filter((slug) => !expectedSlugs.includes(slug));

if (missing.length || orphan.length) {
  if (missing.length) {
    console.error('Missing error doc pages for codes:');
    for (const slug of missing) {
      console.error(`  - docs/src/errors/${slug}.md`);
    }
  }
  if (orphan.length) {
    console.error('Orphan error doc pages (no matching catalog code):');
    for (const slug of orphan) {
      console.error(`  - docs/src/errors/${slug}.md`);
    }
  }
  process.exit(1);
}

console.log(`Validated ${codes.length} error codes against ${slugs.length} doc pages.`);
