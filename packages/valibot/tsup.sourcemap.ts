import { defineConfig, type Options } from 'tsup';
import { defaultOptions, outExtension } from '../../tsup.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-valibot': 'src/index.ts' },
  external: ['vue', 'valibot'],
  sourcemap: 'inline',
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtension: outExtension(),
  },
  {
    ...sharedOptions,
    minify: true,
    outExtension: outExtension(true),
  },
]);
