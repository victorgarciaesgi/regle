#!/usr/bin/env zx

import { $ } from 'zx';

const testTsconfigs = [
  'tests/fixtures/tsconfig.json',
  'tests/unit/useRegle/tsconfig.json',
  'tests/unit/schemas/tsconfig.json',
  'tests/unit/tsconfig.json',
  'tests/plugin-config-tests/tsconfig.json',
];

for (const project of testTsconfigs) {
  await $`tsgo --noEmit --project ${project}`;
}
