import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  dts: true,
  external: ['vue', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom', '@standard-schema/spec'],
  sourcemap: true,
  watch: ['./src', '../shared/utils'],
};

export default defineConfig(sharedOptions);
