import type { Options } from 'tsup';

export function outExtension(isMin = false): Options['outExtension'] | undefined {
  return ({ format }) => {
    let output;
    const min = isMin ? '.min' : '';
    if (format === 'cjs') {
      output = `${min}.cjs`;
    } else if (format === 'esm') {
      output = `${min}.mjs`;
    } else {
      output = `.browser${min}.js`;
    }
    return {
      js: output,
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
