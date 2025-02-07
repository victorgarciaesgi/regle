---
title: Introduction
---

<script setup>
import QuickUsage from '../parts/components/QuickUsage.vue';
</script>

# Introduction

Regle (from the French word for "rule") is a TypeScript-first form validation library made for Vue 3.
I'm a lover and long-time user of Vuelidate API, so Regle's is greatly inspired by it.

Regle is about bringing type safety and great DX for both simple and complex forms.
It's entirely data-driven and headless, allowing the validation logic to mirror your data structure, enabling a clear separation between the UI and validation logic.

Declare your form rules inside a component or a Pinia store and use it wherever you like.


## Installation

### Prerequisites

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

Schema libraires: [Docs](/integrations/schemas-libraries)

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


## Quick usage

<!-- @include: @/parts/QuickUsage.md -->

Result:

<QuickUsage/>


:::tip
You can jump directly to [core concepts](/core-concepts/) to learn usage.
:::
