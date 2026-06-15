/// <reference types="vite-plus/client" />

declare var __USE_DEVTOOLS__: boolean;
declare var __IS_DEV__: boolean;

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}
