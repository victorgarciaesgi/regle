#!/usr/bin/env zx

import { prerelease } from 'semver';
import { $ } from 'zx';
const { version } = require('../package.json');

if (process.env.NODE_AUTH_TOKEN) {
  const tags = prerelease(version);
  try {
    if (tags?.length) {
      await $`pnpm -r --filter='@regle/*' publish --report-summary --no-git-checks --tag ${tags[0]}`;
    } else {
      await $`pnpm -r --filter='@regle/*' publish --report-summary --no-git-checks`;
    }
  } catch (e) {
    console.error(e);
  }
}
