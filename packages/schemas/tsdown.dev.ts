import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';
import { defaultExternals } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  dts: true,
  clean: false,
  external: [...defaultExternals, '@regle/core'],
  watch: ['./src', '../shared/utils'],
};

export default defineConfig(sharedOptions);
