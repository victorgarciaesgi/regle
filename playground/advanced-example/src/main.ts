import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createPinia } from 'pinia';
import { RegleVuePlugin } from '@regle/core';

const pinia = createPinia();

createApp(App).use(pinia).use(RegleVuePlugin).mount('#app');
