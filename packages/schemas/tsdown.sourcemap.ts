import { defineConfig } from 'tsdown';
import { defaultExternals, defaultOptions, productionBuildPlugins } from '../../tsdown.common.build.ts';

export default defineConfig({
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  external: [...defaultExternals, '@regle/core'],
  sourcemap: true,
  treeshake: {
    moduleSideEffects: false,
    annotations: true,
  },
  minify: false,
  plugins: [...productionBuildPlugins],
});
