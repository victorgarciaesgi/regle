import { defineConfig } from 'tsdown';
import { defaultExternals, defaultOptions, productionBuildPlugins } from '../../tsdown.common.build.ts';

export default defineConfig({
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  external: [...defaultExternals, '@vue/devtools-api'],
  sourcemap: true,
  treeshake: {
    moduleSideEffects: false,
    annotations: true,
  },
  dts: false,
  plugins: [...productionBuildPlugins],
});
