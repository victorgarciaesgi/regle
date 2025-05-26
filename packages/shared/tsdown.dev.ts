import { defineConfig, type Options } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev';
import { outExtensions } from '../../tsdown.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-shared': 'index.ts' },
  dts: true,
  clean: false,
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtensions: outExtensions(),
  },
]);
