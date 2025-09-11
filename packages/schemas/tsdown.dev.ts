import { defineConfig, type Options } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  dts: true,
  clean: false,
  external: ['vue', 'valibot', 'zod', '@standard-schema/spec'],
  watch: ['./src', '../shared/utils'],
};

export default defineConfig([
  {
    ...sharedOptions,
  },
]);
