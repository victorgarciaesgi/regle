import type { Options } from 'tsup';

export function outExtension(isMin = false): Options['outExtension'] | undefined {
  return ({ format }) => {
    const prefix = format === 'cjs' ? 'c' : 'm';
    const min = isMin ? 'min.' : '';
    return {
      js: `.${min}${prefix}js`,
    };
  };
}

export const defaultOptions: Options = {
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: false,
  treeshake: true,
};
