---
title: Standard Schema
description: Use Regle as a Standard Schema library
---

# Standard Schema

Regle implements the [Standard Schema](https://standardschema.dev/) specification.

This means that you can use Regle on any third party package that supports the Standard Schema spec.

Regle can also use itself as a schema library when using `useRegleSchema`.

## Usage

```ts
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: { required }
})

const result = await r$.['~standard'].validate({ name: '' });

console.log(result.issues);
```



### Schema only usage

```ts
import { useRules } from '@regle/core';
import { required, string } from '@regle/rules';

const schema = useRules({
  name: { string, required }
})

const result = await schema['~standard'].validate({ name: '' });
```

## Composition usage

```vue
<template>
  <input 
     v-model='r$.$value.email' 
    :class="{ error: r$.email.$error }" 
    placeholder='Type your email'
  />

  <li v-for="error of r$.email.$errors" :key='error'>
    {{ error }}
  </li>
</template>
<script setup lang="ts">
import { useRules } from '@regle/core';
import { required, string } from '@regle/rules';

const r$ = useRules({
  name: { string, required }
})
</script>
```

### `InferInput`

`InferInput` is an utility type that can produce a object state from any rules object.

It will try to extract the possible state type that a rule may have, prioritizing rules that have a strict input type.

Some rules may have `unknown` type because it could apply to any value. To cover this, there is now type-helpers rules to help you type your state from the rules: `type`, `string`, `number`, `boolean`, `date`.

:::info
Some types like `numeric` will feel weird as it's typed `string | number`, it's normal as the rule can also validate numeric strings. You can enforce the type by applying `number` rule to it.
:::

```ts twoslash
import {ref} from 'vue';
// ---cut---
import { defineRules, type InferInput} from '@regle/core';
import { required, string, numeric, type } from '@regle/rules';

/* defineRules is not required, but it helps you catch errors in structure */
const rules = defineRules({
  firstName: { required, string },
  count: { numeric },
  enforceType: { required, type: type<'FOO' | 'BAR'>()}
})

type State = InferInput<typeof rules>;
//     ^?

```

<br/>
<br/>
<br/>

## `useRules`

`useRules` is a composable that allows you to write your rules in a more declarative way.

It works exactly like `useRegle`, but it doesn't accept a state parameter, it will create a emp from the rules.

```ts twoslash

import { useRules, type InferInput } from '@regle/core';
import { required, string } from '@regle/rules';

const r$ = useRules({
  name: { required, string },
});
```

## `refineRules`

Regle is state first because in real world forms, rules can depend a state values.   
This make it a problem for dynamic rules as it would make a cyclic type error when trying to use the state inside the rules.

To cover this case and inspired by Zod's `refine`, Regle provides a `refineRules` helper to write dynamic rules that depend on the state, while making it possible to access a typed state.


Anything returned by the rule refine function will override what's defined in the default rules.

```ts twoslash
import {ref} from 'vue';
// ---cut---
import { refineRules, type InferInput} from '@regle/core';
import { required, string, sameAs } from '@regle/rules';

const rules = refineRules({
  password: { required, string },
}, 
 (state) => ({
   confirmPassword: { required, sameAs: sameAs(() => state.value.password) }
 })
)

type State = InferInput<typeof rules>;
//     ^?
```


