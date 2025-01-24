---
title: Scoped validation
description: Scoped validation in Regle is made to port Vuelidate's nested component validation
---

<script setup>
import ScopedValidationBasic from '../parts/components/scoped-validation/basic-scope/ScopedValidationBasic.vue';
</script>

# Scoped validation

Scoped validation in Regle is made to port Vuelidate's `nested component validation`.

Problems with Vuelidate's approach:
 - Performances
 - Not declarative
 - Usage (too magic for the user)
 - Type safety
 - Restricted to DOM
 - Have to play with `$scope` and `$stopPropagation` to avoid unwanted behaviour


Regle's solution solves all this problems

## `createScopedUseRegle`

To make it declarative, you can use the `createScopedUseRegle` helper method.

It will returns two composable with different usages

```ts twoslash [scoped-config.ts]
import { createScopedUseRegle } from '@regle/core';

export const { useScopedRegle, useCollectScope } = createScopedUseRegle();
```

### `useScopedRegle`

`useScopedRegle` is a clone of `useRegle`, but with the difference that every time it's used and updated, its state will be collected by the same scope created using `createScopedUseRegle`.

Every time it's called, a instance will be added for `useCollectScope` to collect.

It can be called multiple times at any place, not only on components, as it's not restricted by DOM.

### `useCollectScope`

This composable allow you to retrieve every Regle instances created using the sibling composable `useScopedRegle`.

Children properties like `$value` and `$errors` will not be objects, and are converted into arrays instead.

You will also have access to every validation properties like `$error`, `$invalid` etc...


### Exemple


:::code-group

```ts twoslash [scope-config.ts]
import { createScopedUseRegle } from '@regle/core';

export const { useScopedRegle, useCollectScope } = createScopedUseRegle();
```

```vue twoslash [Parent.vue]
<template>
  <div>
    <Child1 />
  </div>

  <Child2 />

  Collected errors: <pre>{{ r$.$errors }}</pre>
</template>

<script setup lang="ts">
import { createScopedUseRegle } from '@regle/core';
const { useScopedRegle, useCollectScope } = createScopedUseRegle();
// ---cut---
// @noErrors
import { useCollectScope } from './scoped-config';
import Child1 from './Child1.vue';
import Child2 from './Child2.vue';

const { r$ } = useCollectScope();
</script>
```


```vue [Child1.vue]
<template>
  <input v-model="r$.$value.firstName" placeholder="Type your firstname" />
  <ul>
    <li v-for="error of r$.$errors.firstName" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScopedRegle } from './scoped-config';

const { r$ } = useScopedRegle({ firstName: '' }, { firstName: { required } });
</script>
```

```vue [Child2.vue]
<template>
  <input v-model="r$.$value.email" placeholder="Type your email" />
  <ul>
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { required, email } from '@regle/rules';
import { useScopedRegle } from './scoped-config';

const { r$ } = useScopedRegle({ email: '' }, { email: { required, email } });
</script>
```
:::


Result:

<ScopedValidationBasic/>



## Multiple scopes

To have multiple scopes in your app, or even in your component, simply create other entries, and use them in the components you need.

```ts twoslash [scoped-config.ts]
import { createScopedUseRegle } from '@regle/core';

export const { useScopedRegle, useCollectScope } = createScopedUseRegle();
export const { 
  useScopedRegle: useContactsRegle, 
  useCollectScope: useCollectContacts 
} = createScopedUseRegle();
```

## Namespaces inside scopes

Each scope can collect a specific namespace. Giving a namespace name will collect only the children with the same namespace name.

The namespace can be reactive, so it will update every time it changes.

In this exemple, only the components using the same scope and same namespace will be collected.

:::code-group
```vue twoslash [Parent.vue]
<script setup lang="ts">
import { createScopedUseRegle } from '@regle/core';
const { useScopedRegle, useCollectScope } = createScopedUseRegle();
// ---cut---
// @noErrors
import { useCollectScope } from './scoped-config';
import Child1 from './Child1.vue';
import Child2 from './Child2.vue';

const { r$ } = useCollectScope('contacts');
</script>
```

```vue [Child1.vue]
<template>
  <input v-model="r$.$value.firstName" placeholder="Type your firstname" />
  <ul>
    <li v-for="error of r$.$errors.firstName" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScopedRegle } from './scoped-config';

const { r$ } = useScopedRegle(
  { firstName: '' }, 
  { firstName: { required } }
  { namespace: 'contacts' }
);
</script>
```

```vue [Child2.vue]
<template>
  <input v-model="r$.$value.email" placeholder="Type your email" />
  <ul>
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { required, email } from '@regle/rules';
import { useScopedRegle } from './scoped-config';

const { r$ } = useScopedRegle({ email: '' }, { email: { required, email } });
</script>
```
:::

## Inject global config

If you have a global config already registered, simply pass it as a parameter to your `createScopedUseRegle` function.

```ts twoslash [scoped-config.ts]
import { createScopedUseRegle, defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';


const { useRegle } = defineRegleConfig({
  rules: () => ({
    custom: withMessage(required, 'Custom error'),
  }),
});

export const { useScopedRegle, useCollectScope } = createScopedUseRegle({customUseRegle: useRegle});

// @noErrors
const {r$} = useScopedRegle({name: ''}, {
  name: {
    cus
//     ^|
  }
})

```


## Custom store for instances

By default collected instances are stored in a local ref. 

You can provide your own store ref.


```ts twoslash
import {ref} from 'vue';
// ---cut---
import { createScopedUseRegle, type ScopedInstancesRecordLike } from '@regle/core';

// Having a default 
const myCustomStore = ref<ScopedInstancesRecordLike>({});

const { useScopedRegle, useCollectScope } = createScopedUseRegle({customStore: myCustomStore});

```

## Manually dispose or register a scope entry

`useScopedRegle` also returns two methods: `dispose` and `register`.

You can then programmaticaly handle if your component is collected from inside.

```vue twoslash
<script setup lang='ts'>
import { createScopedUseRegle } from '@regle/core';
const { useScopedRegle, useCollectScope } = createScopedUseRegle();
// ---cut---
// @noErrors
import { useCollectScope } from './scoped-config';

const { r$, dispose, register } = useScopedRegle();
</script>
```

