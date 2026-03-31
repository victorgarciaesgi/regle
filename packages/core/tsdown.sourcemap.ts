import { defineConfig } from 'tsdown';
import { defaultExternals, defaultOptions, productionBuildPlugins } from '../../tsdown.common.build.ts';

export default defineConfig({
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  deps: {
    neverBundle: [...defaultExternals, '@vue/devtools-api'],
  },
  sourcemap: true,
  treeshake: {
    moduleSideEffects: false,
    annotations: true,
  },
  minify: false,
  plugins: [...productionBuildPlugins],
});
