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

In your form, you'll need to use type narrowing to access your fields status somehow. 

For this you'll have to discriminate the `$fields` depending on value. As the status uses deeply nested properties, this will not be possible with a standard guard `if (value === "EMAIL")`.

In your template or script, you can use Regle's `narrowVariant` helper to narrow the fields to the value.

Let's take the previous exemple again:

```vue twoslash
<template>
    <input v-model="r$.$fields.firstName.$value" placeholder='First name'/>
    <Errors :errors="r$.$fields.firstName.$errors"/>

    <select v-model="r$.$fields.type.$value">
      <option disabled value="">Account type</option>
      <option value="EMAIL">Email</option>
      <option value="GITHUB">Github</option>
    </select>

    <div v-if="narrowVariant(r$.$fields, 'type', 'EMAIL')">
      <!-- `email` is now a known field in this block -->
      <input v-model="r$.$fields.email.$value" placeholder='Email'/>
      <Errors :errors="r$.$fields.email.$errors"/>
    </div>
    
    <div v-else-if="narrowVariant(r$.$fields, 'type', 'GITHUB')">
      <!-- `username` is now a known field in this block -->
      <input v-model="r$.$fields.username.$value" placeholder='Email'/>
      <Errors :errors="r$.$fields.username.$errors"/>
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
import {ref} from 'vue';

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
    <input v-model="r$.$fields.firstName.$value" placeholder='First name'/>
    <Errors :errors="r$.$fields.firstName.$errors"/>

    <select v-model="r$.$fields.login.fields.type.$value">
      <option disabled value="">Account type</option>
      <option value="EMAIL">Email</option>
      <option value="GITHUB">Github</option>
    </select>

    <div v-if="narrowVariant(r$.$fields.login.$fields, 'type', 'EMAIL')">
      <!-- `email` is now a known field in this block -->
      <input v-model="r$.$fields.login.$fields.email.$value" placeholder='Email'/>
      <Errors :errors="r$.$fields.login.$fields.email.$errors"/>
    </div>
    
    <div v-else-if="narrowVariant(r$.$fields.login.$fields, 'type', 'GITHUB')">
      <!-- `username` is now a known field in this block -->
      <input v-model="r$.$fields.login.$fields.username.$value" placeholder='Email'/>
      <Errors :errors="r$.$fields.login.$fields.username.$errors"/>
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

Having a `variantToRef` helper prevent you from creating custom `computed` methods, which would make you lose the `v-model` compabilities of the `.$value`.

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
