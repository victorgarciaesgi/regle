import './assets/base.scss';
import './assets/main.scss';

import { RegleVuePlugin } from '@regle/core';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import AppShell from './AppShell.vue';
import DevtoolsHarness from './DevtoolsHarness.vue';
import DevtoolsCollectionHarness from './DevtoolsCollectionHarness.vue';
import DevtoolsNestedHarness from './DevtoolsNestedHarness.vue';
import DevtoolsSelfHarness from './DevtoolsSelfHarness.vue';
import DevtoolsDynamicHarness from './DevtoolsDynamicHarness.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: App },
    { path: '/devtools', component: DevtoolsHarness },
    { path: '/devtools/nested', component: DevtoolsNestedHarness },
    { path: '/devtools/collection', component: DevtoolsCollectionHarness },
    { path: '/devtools/self', component: DevtoolsSelfHarness },
    { path: '/devtools/dynamic', component: DevtoolsDynamicHarness },
  ],
});

const app = createApp(AppShell);

app.use(RegleVuePlugin);
app.use(router);
app.mount('#app');
