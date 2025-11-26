import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';
import { defaultExternals } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  dts: true,
  external: defaultExternals,
  sourcemap: true,
  watch: ['./src', '../shared/utils'],
};

export default defineConfig(sharedOptions);
