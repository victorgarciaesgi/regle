import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  externals: ['@regle/zod', '@regle/valibot', 'zod', 'valibot'],
});
