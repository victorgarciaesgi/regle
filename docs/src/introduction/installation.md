---
title: Installation
---

# Installation

## Prerequisites

Required
- [Vue](https://vuejs.org/) <span data-title="vue"></span>  `3.3+`.
- [Typescript](https://www.typescriptlang.org/) <span data-title="ee.ts"></span>  `4.8+`. 
  - Compatible with plain javascript.
- Text Editor with Vue syntax support.
  -  [VSCode](https://code.visualstudio.com/) <span data-title=".vscode"></span> is recommended, along with the [official Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

Optional
- [Nuxt](https://nuxt.com/) <span data-title="nuxt"></span> 
  - Nuxt  `3.1+`, and check docs for [Nuxt module](/integrations/nuxt)
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
