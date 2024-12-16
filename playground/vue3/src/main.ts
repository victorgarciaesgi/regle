import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import '@andypf/json-viewer';
import { createPinia } from 'pinia';
const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.mount('#app');
