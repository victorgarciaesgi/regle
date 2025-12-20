import { defineConfig, type UserConfig } from 'tsdown';
import 'dotenv/config';

const sharedOptions: UserConfig = {
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  treeshake: true,
  outExtensions: () => ({ js: '.js' }),
  entry: { 'regle-mcp-server': 'src/index.ts' },
  external: ['zod', '@modelcontextprotocol/sdk'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  env: {
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
  },
  inputOptions(inputOptions) {
    inputOptions.experimental ??= {};
    inputOptions.experimental.attachDebugInfo = 'none';
    return inputOptions;
  },
};

export default defineConfig([sharedOptions]);
