import { defineConfig, type UserConfig } from 'tsdown';
import {
  defaultExternals,
  defaultOptions,
  defineBanner,
  devBuildPlugins,
  outExtensions,
  productionBuildPlugins,
} from '../../tsdown.common.build.ts';
import pkg from './package.json' with { type: 'json' };
const { name, version } = pkg;

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-rules': 'src/index.ts' },
  external: [...defaultExternals, '@regle/core'],
  banner: defineBanner({ name, version }),
};

export default defineConfig([
  {
    ...sharedOptions,
    plugins: [...devBuildPlugins],
  },
  {
    ...sharedOptions,
    minify: true,
    dts: false,
    outExtensions: outExtensions(true),
    plugins: [...productionBuildPlugins],
  },
]);
