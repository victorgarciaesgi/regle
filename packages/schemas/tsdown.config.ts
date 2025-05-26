import { defineConfig, type Options } from 'tsdown';
import { defaultOptions, outExtensions } from '../../tsdown.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  external: ['vue', 'valibot', 'zod', '@standard-schema/spec'],
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtensions: outExtensions(),
  },
  {
    ...sharedOptions,
    minify: true,
    outExtensions: outExtensions(true),
  },
]);
