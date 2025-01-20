import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  externals: ['@regle/schemas', 'zod', 'valibot'],
});
