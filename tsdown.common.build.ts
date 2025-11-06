import type { Options } from 'tsdown';

export function outExtensions(isMin = false): Options['outExtensions'] | undefined {
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

export const defaultOptions: Options = {
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  treeshake: true,
};
