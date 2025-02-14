import { defineConfig, type Options } from 'tsup';
import { defaultOptions } from '../../tsup.common.dev';
import { outExtension } from '../../tsup.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-shared': 'index.ts' },
  dts: true,
  clean: false,
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtension: outExtension(),
  },
]);
