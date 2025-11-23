import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.build.ts';
import { replacePlugin } from 'rolldown/plugins';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  external: [
    'vue',
    '@vue/reactivity',
    '@vue/runtime-core',
    '@vue/runtime-dom',
    '@standard-schema/spec',
    '@vue/devtools-api',
  ],
  sourcemap: true,
  treeshake: {
    moduleSideEffects: false,
    annotations: true,
  },
  plugins: [
    replacePlugin({
      __USE_DEVTOOLS__: 'false',
    }),
  ],
};

export default defineConfig(sharedOptions);
