import { defineConfig, type UserConfig } from 'tsdown';
import {
  defaultOptions,
  outExtensions,
  defaultExternals,
  devBuildPlugins,
  productionBuildPlugins,
  defineBanner,
} from '../../tsdown.common.build.ts';
import pkg from './package.json' with { type: 'json' };
const { name, version } = pkg;

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  external: [...defaultExternals, '@vue/devtools-api'],
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
