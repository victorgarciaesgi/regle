import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import '@andypf/json-viewer';
import { createPinia } from 'pinia';
import {
  createRule,
  defineRegleOptions,
  RegleVuePlugin,
  type RegleCollectionStatus,
  type RegleFieldStatus,
  type RegleStatus,
} from '@regle/core';
import { required, withMessage } from '@regle/rules';

const customRule = createRule({
  validator: (value: any) => value === 'custom',
  message: 'Custom rule',
});
declare module '@regle/core' {
  interface CustomRules {
    customRule: typeof customRule;
  }
  interface CustomFieldProperties {
    $isRequired: boolean;
  }
  interface CustomNestedProperties {
    $isEmpty: boolean;
  }
  interface CustomCollectionProperties {
    $isEmpty: boolean;
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
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
    nested: {
      $isEmpty: (nest) => Object.keys(nest.$fields).length === 0,
    },
    collections: {
      $isEmpty: (collection) => collection.$each.length === 0,
    },
  },
});

const app = createApp(App);
app.use(pinia);

app.use(RegleVuePlugin, options);

app.mount('#app');
