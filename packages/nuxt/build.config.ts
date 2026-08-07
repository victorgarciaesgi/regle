import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  externals: ['@regle/schemas', '@vue/devtools-kit', 'birpc', 'hookable', 'superjson', 'sirv'],
});
