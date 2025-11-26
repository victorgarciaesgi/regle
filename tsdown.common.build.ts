import type { UserConfig } from 'tsdown';

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

export const defaultOptions: UserConfig = {
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  treeshake: true,
  outExtensions: () => ({ js: '.js' }),
};

export const defaultExternals = [
  'vue',
  '@vue/reactivity',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@standard-schema/spec',
  'type-fest',
];
