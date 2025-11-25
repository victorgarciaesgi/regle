import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions, outExtensions, defaultExternals } from '../../tsdown.common.build.ts';
import { replacePlugin } from 'rolldown/plugins';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  external: [...defaultExternals, '@vue/devtools-api'],
};

export default defineConfig([
  {
    ...sharedOptions,
    plugins: [
      replacePlugin({
        __USE_DEVTOOLS__: 'true',
      }),
    ],
  },
  {
    ...sharedOptions,
    minify: true,
    dts: false,
    outExtensions: outExtensions(true),
    treeshake: {
      moduleSideEffects: false,
      annotations: true,
    },
    plugins: [
      replacePlugin({
        __USE_DEVTOOLS__: 'false',
      }),
    ],
  },
]);
