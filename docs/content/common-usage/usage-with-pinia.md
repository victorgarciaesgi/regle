---
title: Usage with Pinia
description: Since Regle is headless, you can use it anywhere in your app
---

<script setup>
</script>

# Usage with Pinia <span data-title='pinia'></span>

Since Regle is headless, you can use it anywhere in your app — whether in a composable or a store.

Using a Pinia store is an excellent way to avoid prop drilling with multiple properties while maintaining type inference seamlessly across your components.

## Using regle in a Pinia store

::tabs
:::tabs-item{label="demo.store.ts"}
```ts
import { required, minLength, email } from '@regle/rules';
import { defineStore } from 'pinia';
import { useRegle } from '@regle/core';

export const useDemoStore = defineStore('demo-store', () => {
  const { r$ } = useRegle({ email: '' }, {
    email: { required, minLength: minLength(4), email }
  })

  return {
    r$
  }
})
```
:::

:::tabs-item{label="text"}
```text
<template>
  <input v-model='r$.$value.email' placeholder='Type your email'/>
  <button type="button" @click="r$.$reset({toInitialState: true})">Reset</button>
</template>

<script setup lang='ts'>
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { r$ } = storeToRefs(demoStore);

</script>
```
:::

:::tabs-item{label="text"}
```text
<template>
  <ul>
    <li v-for="error of r$.$errors.email" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { r$ } = storeToRefs(demoStore);
</script>
```
:::

::
Component A:

<ComponentA />

Component B:

<ComponentB />


## Avoid hydration issues

If you use `store.$dispose()` or Nuxt in SSR mode, you may encounter this error:

:::tabs-item{label="text"}
```text
Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'xxx'
```
:::

This is because Pinia tries to hydrate the stateful property `r$`.
To avoid this, you can use [skipHydrate](https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html#skipHydrate-)

:::tabs-item{label="pinia.store.ts"}
```ts
import { skipHydrate } from 'pinia';

export const usePiniaStore = defineStore('pinia-store', () => {
  const {r$} = useRegle(/** */)

  return { r$: skipHydrate(r$) };
});
```
:::

::note
If you are using Nuxt, you can use the `@regle/nuxt` module that will automatically skip the hydration of the `r$` property.
::
::