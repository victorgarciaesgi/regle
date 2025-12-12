import { defineConfig, type UserConfig } from 'tsdown';

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
  inputOptions(inputOptions) {
    inputOptions.experimental ??= {};
    inputOptions.experimental.attachDebugInfo = 'none';
    return inputOptions;
  },
};

export default defineConfig([sharedOptions]);
