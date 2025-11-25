import { createApp } from 'vue';
import App from './App.vue';
import '@vue/repl/style.css';
import { RegleVuePlugin } from '@regle/core';

const app = createApp(App);

app.use(RegleVuePlugin);
app.mount('#app');
