import { defineConfig, type Options } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev';
import { outExtensions } from '../../tsdown.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  external: ['vue', 'valibot', 'zod', '@standard-schema/spec'],
  sourcemap: true,
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
