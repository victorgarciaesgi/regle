#!/usr/bin/env zx

import { readdir, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..');
const targets = new Set(['node_modules', 'dist', '.turbo', '.nuxt']);
const skipped = new Set(['.git']);

/** @type {string[]} */
const removed = [];

/**
 * @param {string} dir
 */
async function clean(dir) {
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory() || skipped.has(entry.name)) return;

      const path = join(dir, entry.name);

      if (targets.has(entry.name)) {
        const display = relative(root, path) || entry.name;
        console.log(`Removing ${display}`);
        await rm(path, { recursive: true, force: true });
        removed.push(display);
        return;
      }

      await clean(path);
    })
  );
}

await clean(root);

console.log(
  removed.length
    ? `Done. Removed ${removed.length} director${removed.length === 1 ? 'y' : 'ies'}.`
    : 'Nothing to clean.'
);
