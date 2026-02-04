---
title: Installation
---

# Installation

## Prerequisites

Required
- [Vue](https://vuejs.org/) <span data-title="vue"></span>  `3.3+`.
- [Typescript](https://www.typescriptlang.org/) <span data-title="ee.ts"></span>  `5.1+`. 
  - Compatible with plain javascript.
- Text Editor with Vue syntax support.
  -  [VSCode](https://code.visualstudio.com/) <span data-title=".vscode"></span> is recommended, along with the [official Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

Optional
- [Nuxt](https://nuxt.com/) <span data-title="nuxt"></span> 
  - Nuxt  `3.2.0+`, and check docs for [Nuxt module](/integrations/nuxt)
- [Pinia](https://pinia.vuejs.org/) <span data-title="pinia"></span> 
  - Pinia  `2.2.5+`

Schema libraries: [Docs](/integrations/schemas-libraries)

- [Zod](https://zod.dev/) <span data-title="zod"></span> `3.24+`. 
- [Valibot](https://valibot.dev/) <span data-title="valibot"></span> `1+`.
- [ArkType](https://arktype.io/) <span data-title="arktype"></span>  `2+`
- Any library using the [Standard Schema Spec](https://standardschema.dev/) 

<br/>

::: code-group

```sh [pnpm]
pnpm add @regle/core @regle/rules
```

```sh [npm]
npm install @regle/core @regle/rules
```

```sh [yarn]
yarn add @regle/core @regle/rules
```

```sh [bun]
bun add @regle/core @regle/rules
```

:::

## Devtools

To enable devtools, you need to install the Regle plugin in your app.

:::tip
If you use the `@regle/nuxt` module, the devtools will be automatically enabled.
:::

```ts [main.ts]
import { createApp } from 'vue';
import { RegleVuePlugin } from '@regle/core';
import App from './App.vue';

const app = createApp(App);

app.use(RegleVuePlugin); // <--

app.mount('#app');
```


## MCP server

Regle offers an MCP server that can be used to get documentation and autocomplete for Regle.

You can install it using the following configurations:

- [Cursor](/integrations/mcp-server#cursor)
- [Claude Desktop](/integrations/mcp-server#claude-desktop)