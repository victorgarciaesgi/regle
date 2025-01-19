import { defineConfig, type Options } from 'tsup';
import { defaultOptions, outExtension } from '../../tsup.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  dts: true,
  clean: false,
  external: ['vue', 'valibot', 'zod'],
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtension: outExtension(),
  },
]);
