---
title: Variants
description: Define variants rules for your discriminated unions
---

<script setup>
import SimpleVariant from '../parts/components/variants/SimpleVariant.vue';
</script>


# Variants or discriminated unions

Your form may not be linear, and have multiple fields that depends on a condition or a toggle.
It can be complex and become a mess when trying to organise your types around it.

Regle variants offer a way to simply declare and use this discriminated unions, while keeping all fields correctly types and also runtime safe.


## `createVariant`

The first first step to Regle variants is to have a type that includes a discriminated variant.

```ts twoslash include form-types
type FormStateLoginType = 
| {type: 'EMAIL', email: string} 
| {type: 'GITHUB', username: string} 
| {type?: undefined}

type FormState = {
  firstName?: string;
  lastName?: string;
} & FormStateLoginType
```

Here your state can have two possible outcomes, but with classic rules it's hard to handle fields statuses as they can always be undefined.

The solution to this is to first declare your variant-related rules inside `createVariant` like this:

```ts twoslash include main
import {ref} from 'vue';
// @include: form-types
// ---cut---
import { useRegle, createVariant} from '@regle/core';
import { literal, required, email } from '@regle/rules';

const state = ref<FormState>({})

// ⚠️ Use getter syntax for your rules () => {} or a computed one
const {r$} = useRegle(state, () => {
  /** 
   * Here you create you rules variations, see each member as a `OR` 
   * `type` here is the discriminant
   * 
   * Depending of the value of `type`, Regle will apply the corresponding rules.
  */
  const variant = createVariant(state, 'type', [
    {type: { literal: literal('EMAIL')}, email: { required, email }},
    {type: { literal: literal('GITHUB')}, username: { required }},
    {type: { required }},
  ]);


  return {
    firstName: {required},
    // Don't forget to return the computed rules
    ...variant.value,
  };
})
```


## `narrowVariant`

In your form, you'll need to use type narrowing to access your field status somehow. 

For this you'll have to discriminate the `$fields` depending on value. As the status uses deeply nested properties, this will not be possible with a standard guard `if (value === "EMAIL")`.

In your template or script, you can use Regle's `narrowVariant` helper to narrow the fields to the value.

Let's take the previous example again:

```vue twoslash
<template>
    <input v-model="r$.firstName.$value" placeholder='First name'/>
    <Errors :errors="r$.firstName.$errors"/>

    <select v-model="r$.type.$value">
      <option disabled value="">Account type</option>
      <option value="EMAIL">Email</option>
      <option value="GITHUB">Github</option>
    </select>

    <div v-if="narrowVariant(r$, 'type', 'EMAIL')">
      <!-- `email` is now a known field in this block -->
      <input v-model="r$.email.$value" placeholder='Email'/>
      <Errors :errors="r$.email.$errors"/>
    </div>
    
    <div v-else-if="narrowVariant(r$, 'type', 'GITHUB')">
      <!-- `username` is now a known field in this block -->
      <input v-model="r$.username.$value" placeholder='Email'/>
      <Errors :errors="r$.username.$errors"/>
 //                                 ^? 
    </div>

</template>

<script setup lang='ts'>
// @include: main
// @noErrors
function useExample() {
  return {r$}
}
// ---cut---
import {narrowVariant} from '@regle/core';

const {r$} = useExample();
</script>
```

Result:

<SimpleVariant/>



### Nested variants

All the above also works for nested variants

```ts twoslash include nested-types
type FormState = {
  firstName?: string;
  lastName?: string;
  login: 
    | {type: 'EMAIL', email: string} 
    | {type: 'GITHUB', username: string} 
    | {type?: undefined}
}

```

:::warning
The first argument of `createVariant` needs to be reactive. For nested values, use getter syntax.
:::

```ts twoslash include nested-regle
import {ref, defineComponent} from 'vue';

const Errors = defineComponent({});

// @include: nested-types

// ---cut---
import { useRegle, createVariant} from '@regle/core';
import { literal, required, email } from '@regle/rules';

const state = ref<FormState>({
  firstName: '',
  login: {}
})

const {r$} = useRegle(state, () => {

  const loginVariant = createVariant(() => state.value.login, 'type', [
    {type: { literal: literal('EMAIL')}, email: { required, email }},
    {type: { literal: literal('GITHUB')}, username: { required }},
    {type: { required}},
  ]);

  return {
    firstName: {required},
    login: loginVariant.value
  };
})
```

In the component:

```vue twoslash
<template>
    <input v-model="r$.firstName.$value" placeholder='First name'/>
    <Errors :errors="r$.firstName.$errors"/>

    <select v-model="r$.login.type.$value">
      <option disabled value="">Account type</option>
      <option value="EMAIL">Email</option>
      <option value="GITHUB">Github</option>
    </select>

    <div v-if="narrowVariant(r$.login, 'type', 'EMAIL')">
      <!-- `email` is now a known field in this block -->
      <input v-model="r$.login.email.$value" placeholder='Email'/>
      <Errors :errors="r$.login.email.$errors"/>
    </div>
    
    <div v-else-if="narrowVariant(r$.login, 'type', 'GITHUB')">
      <!-- `username` is now a known field in this block -->
      <input v-model="r$.login.username.$value" placeholder='Email'/>
      <Errors :errors="r$.login.username.$errors"/>
    </div>

</template>

<script setup lang='ts'>
// @include: nested-regle
// @noErrors
function useExample() {
  return {r$}
}
// ---cut---
import {narrowVariant} from '@regle/core';

const {r$} = useExample();
</script>
```


## `variantToRef`



A use case is also to have a narrowed **Ref** ready to be used and isn't tied to a block scope. Like in the root of a script setup component where you're sure only one variant is possible.

Having a `variantToRef` helper prevents you from creating custom `computed` methods, which would make you lose the `v-model` compatibilities of the `.$value`.

The **ref** will be reactive and already typed as the variant you defined, while still needing to be checked for nullish.

:::code-group
```vue twoslash [Github.vue]
<template>
    <div v-if="githubVariant$">
      <input v-model="githubVariant$.username.$value" placeholder='Email'/>
      <Errors :errors="githubVariant$.username.$errors"/>
    </div>
</template>

<script setup lang='ts'>
import { defineComponent } from 'vue';
const Errors = defineComponent({});
// ---cut---
import {ref} from 'vue';
import { defineStore, skipHydrate} from 'pinia';
import { useRegle, createVariant} from '@regle/core';
import { literal, required, email } from '@regle/rules';

// @include: form-types

const useFormStore = defineStore('form', () => {
  
  const state = ref<FormState>({});

  const {r$} = useRegle(state, () => {
    
    const variant = createVariant(state, 'type', [
      {type: { literal: literal('EMAIL')}, email: { required, email }},
      {type: { literal: literal('GITHUB')}, username: { required }},
      {type: { required}},
    ]);


    return {
      firstName: {required},
      ...variant.value,
    };
  })

  return {
    r$: skipHydrate(r$),
  }
})
// ---cut---
import { storeToRefs } from 'pinia';
import { variantToRef } from '@regle/core';

const {r$} = storeToRefs(useFormStore());

const githubVariant$ = variantToRef(r$, 'type', 'GITHUB');
</script>
```

```ts twoslash [form.store.ts]
import {ref} from 'vue';
import { defineStore, skipHydrate} from 'pinia';
import { useRegle, createVariant} from '@regle/core';
import { literal, required, email } from '@regle/rules';

// @include: form-types

export const useFormStore = defineStore('form', () => {
  
  const state = ref<FormState>({});

  const {r$} = useRegle(state, () => {
    
    const variant = createVariant(state, 'type', [
      {type: { literal: literal('EMAIL')}, email: { required, email }},
      {type: { literal: literal('GITHUB')}, username: { required }},
      {type: { required}},
    ]);


    return {
      firstName: {required},
      ...variant.value,
    };
  })

  return {
    r$: skipHydrate(r$),
  }
})
```

:::


### `unsafeAssertion` option

When using `variantToRef` in a component it happens that the assertion is done by the parent component, which means you know the variant assertion will always be valid in the entire component.

For this case you can pass an option to assert that the variant is always defined.

```ts
import { variantToRef } from '@regle/core';

const variant$ = variantToRef(r$, 'type', 'EMAIL', { unsafeAssertion: true });
// ^ Removes the `undefined`

```