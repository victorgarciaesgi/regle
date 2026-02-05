import { defineConfig } from 'taze';

export default defineConfig({
  exclude: [
    'vue-3.4',
    '@vue/reactivity-3.4',
    '@vue/runtime-core-3.4',
    '@vue/runtime-dom-3.4',
    '@vue/shared-3.4',
    '@vue/compiler-dom-3.4',
    '@vue/server-renderer-3.4',
    'pinia-2.2.5',
    '@vue/devtools-kit',
    '@vue/devtools-api',
  ],
  includeLocked: true,
  interactive: true,
  recursive: true,
  write: true,
  install: true,
  ignorePaths: ['**/node_modules/**'],
  ignoreOtherWorkspaces: true,
  maturityPeriod: 2,
});
