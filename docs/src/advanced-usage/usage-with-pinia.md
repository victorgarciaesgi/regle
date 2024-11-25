---
title: Usage with Pinia
---

<script setup>
import ComponentA from '../parts/components/pinia/ComponentA.vue';
import ComponentB from '../parts/components/pinia/ComponentB.vue';
</script>

# Usage with Pinia

As Regle is headless, you can use it in any place of your app, a composable, and also a store.

Using a Pinia store is great for avoiding to do prop drilling with all the properties, and easily keep type inference in your components.


## Using regle in a Pinia store

::: code-group
```ts twoslash include store [demo.store.ts] 
// @module: esnext
// @filename: demo.store.ts
// ---cut---
import {required, minLength, email} from '@regle/rules';
import {defineStore} from 'pinia';
import {useRegle} from '@regle/core';

export const useDemoStore = defineStore('demo-store', () => {

  const regleProperties = useRegle({email: ''}, {
    email: {required, minLength: minLength(4), email}
  })

  // This is a proposed way to export the properties without redundant code
  // You can also export it one my one as each property is reactive
  return {
    ...regleProperties
  }
})
```

``` vue twoslash [ComponentA.vue]
<template>
  <input v-model='state.email' placeholder='Type your email'/>
  <button type="button" @click="demoStore.resetAll">Reset</button>
</template>

<script setup lang='ts'>
// @include: store
// @noErrors
// ---cut---
// @module: esnext
import {useDemoStore} from './demo.store';
import {storeToRefs} from 'pinia';

const demoStore = useDemoStore();
const {state} = storeToRefs(demoStore);

</script>
```

``` vue twoslash [ComponentB.vue]
<template>
  <ul>
    <li v-for="error of r$.$errors.email" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
// @include: store
// @noErrors
// ---cut---
// @module: esnext
import {useDemoStore} from './demo.store';
import {storeToRefs} from 'pinia';

const demoStore = useDemoStore();
const {r$} = storeToRefs(demoStore);

</script>
```

:::

Component A:

<ComponentA/>

Component B:

<ComponentB/>