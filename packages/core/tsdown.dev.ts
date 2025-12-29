import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';
import { defaultExternals, devBuildPlugins } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  dts: true,
  external: [...defaultExternals, '@vue/devtools-api'],
  sourcemap: true,
  watch: ['./src', '../shared/utils'],
  plugins: [...devBuildPlugins],
};

export default defineConfig(sharedOptions);
