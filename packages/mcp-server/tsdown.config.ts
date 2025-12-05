import { defineConfig, type UserConfig } from 'tsdown';

const sharedOptions: UserConfig = {
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  treeshake: true,
  outExtensions: () => ({ js: '.js' }),
  entry: { 'regle-mcp-server': 'src/index.ts' },
  external: ['zod'],
  banner: {
    js: '#!/usr/bin/env node',
  },
};

export default defineConfig([sharedOptions]);
