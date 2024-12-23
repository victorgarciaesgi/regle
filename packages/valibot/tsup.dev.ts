import { defineConfig, type Options } from 'tsup';
import { defaultOptions, outExtension } from '../../tsup.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-valibot': 'src/index.ts' },
  dts: true,
  clean: false,
  external: ['vue', 'valibot'],
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtension: outExtension(),
  },
]);
