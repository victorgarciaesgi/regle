import devConfig from './pack.dev.ts';
import sourcemapConfig from './pack.sourcemap.ts';
import { defineConfig } from 'vite-plus';
import type { UserConfig } from 'vite-plus/pack';
import {
  defaultOptions,
  outExtensions,
  defaultExternals,
  devBuildPlugins,
  productionBuildPlugins,
  defineBanner,
  packageValidationOptions,
} from '../../tsdown.common.build.ts';
import pkg from './package.json' with { type: 'json' };
const { name, version } = pkg;

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  deps: {
    neverBundle: [...defaultExternals, '@vue/devtools-api'],
  },
  banner: defineBanner({ name, version }),
};

const productionConfig: UserConfig[] = [
  {
    ...sharedOptions,
    plugins: [...devBuildPlugins],
  },
  {
    ...sharedOptions,
    minify: true,
    dts: false,
    treeshake: {
      moduleSideEffects: false,
      annotations: true,
    },
    outExtensions: outExtensions(true),
    plugins: [...productionBuildPlugins],
    ...packageValidationOptions,
  },
];

export default defineConfig({
  pack:
    process.env.REGLE_BUILD_MODE === 'dev'
      ? devConfig
      : process.env.REGLE_BUILD_MODE === 'sourcemap'
        ? sourcemapConfig
        : productionConfig,
});
