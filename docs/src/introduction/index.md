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
- [Vue](https://vuejs.org/) <span data-title="vue"></span> version `3.3` or higher.
- [Typescript](https://www.typescriptlang.org/) <span data-title="ee.ts"></span> version `4.8` or higher
  - Also compatible with plain javascript.
- Text Editor with Vue syntax support.
  -  [VSCode](https://code.visualstudio.com/) <span data-title=".vscode"></span> is recommended, along with the [official Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

Optional
- [Nuxt](https://nuxt.com/) <span data-title="nuxt"></span> 
  - Nuxt version `3.0` or higher, and check docs for [Nuxt module](/integrations/nuxt)
- [Pinia](https://pinia.vuejs.org/) <span data-title="pinia"></span> 
  - Pinia version `2.1` or higher
- [Zod](https://zod.dev/) <span data-title="zod"></span> 
  - Zod version `3.0` or higher. Check [Zod usage](/integrations/zod)
- [Valibot](https://valibot.dev/) <span data-title="valibot"></span> 
  - Valibot version `1.0.0-beta.9` or higher. Check [Valibot usage](/integrations/valibot)

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
