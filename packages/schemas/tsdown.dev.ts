import { defineConfig, type Options } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  dts: true,
  clean: false,
  external: ['vue', 'valibot', 'zod', '@standard-schema/spec'],
};

export default defineConfig([
  {
    ...sharedOptions,
  },
]);
