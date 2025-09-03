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


## Collecting validation with `useCollectScope` and `useScopedRegle`

### `useScopedRegle`

`useScopedRegle` is a clone of `useRegle`, but with the difference that every time it's used and updated, its state will be collected by the same scope created using `createScopedUseRegle`.

Every time it's called, a instance will be added for `useCollectScope` to collect.

It can be called multiple times at any place, not only on components, as it's not restricted by DOM.

### `useCollectScope`

This composable allow you to retrieve every Regle instances created using the sibling composable `useScopedRegle`.

Children properties like `$value` and `$errors` will not be objects, and are converted into arrays instead.

You will also have access to every validation properties like `$error`, `$invalid` etc...


:::code-group

```vue [Parent.vue]
<template>
  <div>
    <Child1 />
  </div>

  <Child2 />

  Collected errors: <pre>{{ r$.$errors }}</pre>
</template>

<script setup lang="ts">
import { useCollectScope } from '@regle/core';
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
import { useScopedRegle } from '@regle/core';

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
import { useScopedRegle } from '@regle/core';

const { r$ } = useScopedRegle({ email: '' }, { email: { required, email } });
</script>
```
:::


Result:

<ScopedValidationBasic/>



## Multiple scopes

If you want to create your own separated scope, you can use `createScopedUseRegle` helper method.

It's advised to change the name of this composable to avoid conflicts or issues.

```ts [scoped-config.ts]
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

In this example, only the components using the same scope and namespace will be collected.

:::code-group
```vue [Parent.vue]
<script setup lang="ts">
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


```ts
import {ref} from 'vue';
// ---cut---
import { createScopedUseRegle, type ScopedInstancesRecordLike } from '@regle/core';

// Having a default 
const myCustomStore = ref<ScopedInstancesRecordLike>({});

const { useScopedRegle, useCollectScope } = createScopedUseRegle({customStore: myCustomStore});
```

## Collect instances in a Record

By default collected instances are stored in a readonly array.

If you want to store your nested instances in a record it's possible with the `asRecord` option.

This will **require** every nested `useScopeRegle` to provide a parameter `scopeKey`.

:::code-group

```ts [scoped-config.ts]
import { createScopedUseRegle } from '@regle/core';

export const { 
  useScopedRegle: useScopedRegleItem, 
  useCollectScope: useCollectScopeRecord 
} = createScopedUseRegle({ asRecord: true });
```
```vue [Parent.vue]
<script setup lang="ts">
import { useCollectScopeRecord } from './scoped-config';
import Child1 from './Child1.vue';
import Child2 from './Child2.vue';

const { r$ } = useCollectScopeRecord<{
    child1: {firstName: string},
    child2: {email: string},
  }>();

console.log(r$.$value.child1.firstName);
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
import { useScopedRegleItem } from './scoped-config';

const { r$ } = useScopedRegleItem(
  { firstName: '' }, 
  { firstName: { required } }
  { scopeKey: 'child1' }
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
import { useScopedRegleItem } from './scoped-config';

const { r$ } = useScopedRegleItem({ email: '' }, 
  { email: { required, email } }, 
  { scopeKey: 'child2' });
</script>
```
:::

## Manually dispose or register a scope entry

`useScopedRegle` also returns two methods: `dispose` and `register`.

You can then programmatically handle if your component is collected from inside.

```vue
<script setup lang='ts'>
import { useCollectScope } from './scoped-config';

const { r$, dispose, register } = useScopedRegle();
</script>
```


## Manual typing

:::warning
Use with care, only if you're 100% sure of what return type your collected types will have.

The order of the collected values can change depending on if they added/deleted.
This is here for convenience but not advised.
:::

```ts twoslash
import { useCollectScope } from '@regle/core';

const { r$ } = useCollectScope<[{ foo: string }]>();

const { valid, data } = await r$.$validate();
//               ^?
```
