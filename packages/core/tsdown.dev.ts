import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';
import { replacePlugin } from 'rolldown/plugins';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  dts: true,
  external: [
    'vue',
    '@vue/reactivity',
    '@vue/runtime-core',
    '@vue/runtime-dom',
    '@standard-schema/spec',
    '@vue/devtools-api',
  ],
  sourcemap: true,
  watch: ['./src', '../shared/utils'],
  plugins: [
    replacePlugin({
      __USE_DEVTOOLS__: 'true',
    }),
  ],
};

export default defineConfig(sharedOptions);
