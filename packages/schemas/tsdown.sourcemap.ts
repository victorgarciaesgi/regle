import { defineConfig, type Options } from 'tsdown';
import { defaultOptions, outExtensions } from '../../tsdown.common.build.ts';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  external: ['vue', 'valibot', 'zod', '@standard-schema/spec'],
  sourcemap: true,
};

export default defineConfig([
  {
    ...sharedOptions,
  },
  {
    ...sharedOptions,
    minify: true,
    dts: false,
    outExtensions: outExtensions(true),
  },
]);
