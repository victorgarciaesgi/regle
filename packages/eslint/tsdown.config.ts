import { defineConfig, type UserConfig } from 'tsdown';

const sharedOptions: UserConfig = {
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: false,
  treeshake: true,
  outExtensions: () => ({ js: '.js' }),
  entry: { 'regle-eslint': 'src/index.ts' },
  inputOptions(inputOptions) {
    inputOptions.experimental ??= {};
    inputOptions.experimental.attachDebugInfo = 'none';
    return inputOptions;
  },
};

export default defineConfig([sharedOptions]);
