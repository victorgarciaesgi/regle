import './assets/base.scss';
import './assets/main.scss';
import { createRouter, createWebHistory } from 'vue-router';

import { createApp } from 'vue';

import App from './App.vue';

const app = createApp(App);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: {},
    },
  ],
});

app.mount('#app');
