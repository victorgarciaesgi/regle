import { replacePlugin } from 'rolldown/plugins';
import { nosticsStrip } from '@nostics/unplugin/strip-transform';
import type { UserConfig } from 'vite-plus/pack';

export function outExtensions(isMin = false): UserConfig['outExtensions'] | undefined {
  return ({ format }) => {
    let output;
    const min = isMin ? '.min' : '';
    if (format === 'es') {
      output = `${min}.js`;
    } else {
      output = `.browser${min}.js`;
    }

    return {
      js: output,
    };
  };
}

export const devBuildPlugins = [
  replacePlugin({
    __USE_DEVTOOLS__: 'true',
    __IS_DEV__: 'true',
  }),
  nosticsStrip.rolldown({ packageName: 'nostics' }),
];

export const productionBuildPlugins = [
  replacePlugin({
    __USE_DEVTOOLS__: 'false',
    __IS_DEV__: 'false',
  }),
  nosticsStrip.rolldown({ packageName: 'nostics' }),
];

export function defineBanner({ name, version }: { name: string; version: string }) {
  return `/**
 * ${name} v${version}
 * (c) ${new Date().getFullYear()} Victor Garcia
 * @license MIT
 */
`;
}

export const defaultOptions: UserConfig = {
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  outExtensions: () => ({ js: '.js' }),
  inputOptions(inputOptions) {
    inputOptions.experimental ??= {};
    inputOptions.experimental.attachDebugInfo = 'none';
    return inputOptions;
  },
  outputOptions(outputOptions) {
    outputOptions.comments = {
      legal: true,
    };
    return outputOptions;
  },
};

export const defaultExternals = [
  'vue',
  '@vue/reactivity',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@standard-schema/spec',
  'type-fest',
] as const;
