<script setup lang="ts">
import Sun from './icons/Sun.vue';
import Moon from './icons/Moon.vue';
import Share from './icons/Share.vue';
import GitHub from './icons/GitHub.vue';
import type { ReplStore } from '@vue/repl';
import VersionSelect from './VersionSelect.vue';

const props = defineProps<{
  store: ReplStore;
  dev: boolean;
}>();

const emit = defineEmits(['toggle-theme', 'toggle-dev']);

const { store } = props;

async function copyLink(e: MouseEvent) {
  if (e.metaKey) {
    return;
  }
  await navigator.clipboard.writeText(location.href);
  alert('Sharable URL has been copied to clipboard.');
}

function toggleDark() {
  const cls = document.documentElement.classList;
  cls.toggle('dark');
  localStorage.setItem('vue-sfc-playground-prefer-dark', String(cls.contains('dark')));
  emit('toggle-theme', cls.contains('dark'));
}
</script>

<template>
  <nav>
    <h1>
      <a href="https://reglejs.dev" target="_blank" style="display: flex; align-items: center">
        <img alt="logo" src="/favicon-playground.svg" />
        <span>Regle Playground</span>
      </a>
    </h1>
    <div class="links">
      <VersionSelect v-model="store.typescriptVersion" pkg="typescript" label="Typescript"> </VersionSelect>

      <button
        title="Toggle development production mode"
        class="toggle-dev"
        :class="{ dev }"
        @click="$emit('toggle-dev')"
      >
        <span>{{ dev ? 'DEV' : 'PROD' }}</span>
      </button>
      <button title="Toggle dark mode" class="toggle-dark" @click="toggleDark">
        <Sun class="light" />
        <Moon class="dark" />
      </button>
      <button title="Copy sharable URL" class="share" @click="copyLink">
        <Share />
      </button>
      <a href="https://github.com/victorgarciaesgi/regle" target="_blank" title="View on GitHub" class="github">
        <GitHub />
      </a>
    </div>
  </nav>
</template>

<style>
nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;
  --btn: #666;
  --highlight: #333;
  --green: #00bb7f;
  --purple: #cc6464;
  --btn-bg: #eee;

  color: var(--base);
  height: var(--nav-height);
  box-sizing: border-box;
  padding: 0 1em;
  background-color: var(--bg);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.33);
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
}

.dark nav {
  --base: #ddd;
  --bg: #1a1a1a;
  --bg-light: #242424;
  --border: #383838;
  --highlight: #fff;
  --btn-bg: #333;

  box-shadow: none;
  border-bottom: 1px solid var(--border);
}

h1 {
  font-weight: 600;
  font-size: 16px;
  display: inline-flex;
  place-items: center;
  margin-top: 0;
  margin-bottom: 0;
}

h1 a {
  color: transparent;
  background-image: linear-gradient(90deg, #1aedaa, #00bb7f);
  background-clip: text;
  -webkit-background-clip: text;
  text-decoration: none;
}

h1 img {
  height: 24px;
  margin-right: 10px;
}

@media (max-width: 570px) {
  h1 span {
    display: none;
  }
}

@media (max-width: 770px) {
  btn.download {
    display: none;
  }
}

.links {
  display: flex;
}

.toggle-dev span {
  font-size: 12px;
  border-radius: 4px;
  padding: 4px 6px;
}

.toggle-dev span {
  background: #6ba4ef;
  color: #fff;
}

.toggle-dev.dev span {
  background: var(--green);
}

.toggle-dark svg {
  width: 18px;
  height: 18px;
}

.toggle-dark .dark,
.dark .toggle-dark .light {
  display: none;
}

.dark .toggle-dark .dark {
  display: inline-block;
}

.links button,
.links .github {
  padding: 1px 6px;
  color: var(--btn);
}

.links button:hover,
.links .github:hover {
  color: var(--highlight);
}

.version:hover .active-version::after {
  border-top-color: var(--btn);
}

.dark .version:hover .active-version::after {
  border-top-color: var(--highlight);
}

.versions {
  display: none;
  position: absolute;
  left: 0;
  top: 40px;
  background-color: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 4px;
  list-style-type: none;
  padding: 8px;
  margin: 0;
  width: 200px;
  max-height: calc(100vh - 70px);
  overflow: scroll;
}

.versions a {
  display: block;
  padding: 6px 12px;
  text-decoration: none;
  cursor: pointer;
  color: var(--base);
}

.versions a:hover {
  color: var(--color-branding);
}

.versions.expanded {
  display: block;
}

.links > * {
  display: flex;
  align-items: center;
}

.links > * + * {
  margin-left: 4px;
}

.version-logo {
  height: 1.2em;
  margin-right: 4px;
}
</style>
