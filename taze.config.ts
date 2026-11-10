import { defineConfig } from 'taze';

export default defineConfig({
  exclude: ['@vue/devtools-kit', '@vue/devtools-api'],
  includeLocked: true,
  interactive: true,
  recursive: true,
  write: true,
  install: true,
  ignorePaths: ['**/node_modules/**'],
  ignoreOtherWorkspaces: true,
  maturityPeriod: 2,
});
