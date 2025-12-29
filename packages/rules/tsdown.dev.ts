import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';
import { defaultExternals, devBuildPlugins } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-rules': 'src/index.ts' },
  dts: true,
  clean: false,
  external: [...defaultExternals, '@regle/core'],
  watch: ['./src', '../shared/utils'],
  plugins: [...devBuildPlugins],
};

export default defineConfig(sharedOptions);
