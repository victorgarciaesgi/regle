---
title: Introduction
---

<script setup>
import QuickUsage from '../parts/components/QuickUsage.vue';
</script>

# Introduction

Regle (French word for "rule") is a Typescript-first form validation library made for Vue 3.
I'm a lover and long-time user of Vuelidate API, so Regle's is be greatly inspired by it.

Regle is about bringing type safety and great DX to simple or complex Form.
It's all data-based and headless, the validation matches the data structure so can seperate UI and validations.

Declare your form rules inside a component or a Pinia stores and use it wherever you like.


## Installation

### Prerequisites

- [Vue](https://vuejs.org/) version 3.1 or higher.
- Text Editor with Vue syntax support.
  - [VSCode](https://code.visualstudio.com/) is recommended, along with the [official Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).


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