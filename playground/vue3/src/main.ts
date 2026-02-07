import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import '@andypf/json-viewer';
import { createPinia } from 'pinia';
import { createRule, defineRegleOptions, RegleVuePlugin } from '@regle/core';
import { required, withMessage } from '@regle/rules';

const customRule = createRule({
  validator: (value: any) => value === 'custom',
  message: 'Custom rule',
});
declare module '@regle/core' {
  interface CustomRules {
    customRule: typeof customRule;
  }
}

const pinia = createPinia();

const options = defineRegleOptions({
  rules: () => ({
    required: withMessage(required, 'Coucou'),
  }),
  modifiers: {
    autoDirty: false,
  },
});

const app = createApp(App);
app.use(pinia);

app.use(RegleVuePlugin, options);

app.mount('#app');
