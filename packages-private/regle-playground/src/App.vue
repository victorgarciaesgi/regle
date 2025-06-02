<script setup lang="ts">
import type { SFCOptions } from '@vue/repl';
import { Repl, useStore } from '@vue/repl';
import Monaco from '@vue/repl/monaco-editor';
import { onMounted, ref, watchEffect } from 'vue';
import { AppVue } from './defaults';
import Header from './Header.vue';

const setVH = () => {
  document.documentElement.style.setProperty('--vh', window.innerHeight + `px`);
};
window.addEventListener('resize', setVH);
setVH();

const useDevMode = ref(false);

let hash = location.hash.slice(1);
if (hash.startsWith('__DEV__')) {
  hash = hash.slice(7);
  useDevMode.value = true;
}

const store = useStore({}, hash);

const sfcOptions: SFCOptions = {
  script: {
    inlineTemplate: !useDevMode.value,
    isProd: !useDevMode.value,
  },
  style: {
    isProd: !useDevMode.value,
  },
  template: {
    isProd: !useDevMode.value,
  },
};

if (!hash) {
  store.setImportMap({
    imports: {
      ...store.getImportMap().imports,
      vue: 'https://play.vuejs.org/vue.runtime.esm-browser.js',
      'vue/server-renderer': 'https://play.vuejs.org/server-renderer.esm-browser.js',
      '@regle/core': 'https://www.unpkg.com/@regle/core@latest/dist/regle-core.min.js',
      '@regle/rules': 'https://www.unpkg.com/@regle/rules@latest/dist/regle-rules.min.js',
      '@regle/schemas': 'https://www.unpkg.com/@regle/schemas@latest/dist/regle-schemas.min.js',
      zod: 'https://cdn.jsdelivr.net/npm/zod@3.24.3/+esm',
      valibot: 'https://cdn.jsdelivr.net/npm/valibot@1.0.0/+esm',
    },
  });

  store.setFiles({
    ...store.getFiles(),
    'App.vue': AppVue,

    'tsconfig.json': `
      {
        "compilerOptions": {
          "allowJs": true,
          "checkJs": true,
          "jsx": "Preserve",
          "target": "ESNext",
          "module": "ESNext",
          "moduleResolution": "Bundler",
          "allowImportingTsExtensions": true,
          "strict": true
        }
      }
    `,
  });
}

// persist state
watchEffect(() => {
  const newHash = store.serialize().replace(/^#/, useDevMode.value ? `#__DEV__` : `#`);
  history.replaceState({}, '', newHash);
});

function toggleDevMode() {
  const dev = (useDevMode.value = !useDevMode.value);
  sfcOptions.script!.inlineTemplate =
    sfcOptions.script!.isProd =
    sfcOptions.template!.isProd =
    sfcOptions.style!.isProd =
      !dev;
  store.setFiles(store.getFiles());
}

const theme = ref<'dark' | 'light'>('dark');
function toggleTheme(isDark: boolean) {
  theme.value = isDark ? 'dark' : 'light';
}

onMounted(() => {
  const cls = document.documentElement.classList;
  toggleTheme(cls.contains('dark'));
});
</script>

<template>
  <Header :store="store" :dev="useDevMode" @toggle-theme="toggleTheme" @toggle-dev="toggleDevMode" />
  <Repl
    :theme="theme"
    :editor="Monaco"
    :store="store"
    :show-compile-output="false"
    :auto-resize="true"
    :sfc-options="sfcOptions"
    :clear-console="false"
    @keydown.ctrl.s.prevent
    @keydown.meta.s.prevent
  />
</template>

<style>
:root {
  --c-branding: #027d56;
  --c-branding-dark: #00bb7f;

  --color-branding: var(--c-branding);
  --color-branding-dark: var(--c-branding-dark);
}

.dark {
  --c-branding: #00bb7f;

  --color-branding: var(--c-branding);
  --color-branding-dark: var(--c-branding-dark);
}

.dark {
  color-scheme: dark;
}

body {
  font-size: 13px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
}

.vue-repl {
  height: calc(var(--vh) - var(--nav-height)) !important;
}

button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>

<style scoped>
.vue-repl :deep(.split-pane) {
  --color-branding: var(--c-branding);
  --color-branding-dark: var(--c-branding-dark);
}
</style>
