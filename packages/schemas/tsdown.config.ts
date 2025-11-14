import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions, outExtensions } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  external: ['vue', 'valibot', 'zod', '@standard-schema/spec'],
};

export default defineConfig([
  sharedOptions,
  {
    ...sharedOptions,
    minify: true,
    dts: false,
    outExtensions: outExtensions(true),
  },
]);
