---
title: Reseting forms
description: How to reset forms and fields
---

<script setup lang="ts">
import ResetBasic from '../parts/components/reset/ResetBasic.vue';
</script>

# Reseting forms

Regle offers multiple options to reset a form. It depends on your use case and what you want to achieve.

It can be either:
- Only resetting the validation state ($dirty, $invalid, $pending etc..)
- Only resetting the form state ($value) and keeping the validation state
- Resetting the form state to a given state and keeping the validation state
- Resetting the form state to a given state and clearing the validation state
- Reset both form state and validation state to a pristine state

## Basic usage, with `$reset` method

The `$reset` method is available on every nested instance of field of a form. So you can reset fields individually or the whole form.

### Options


### `toInitialState`
- **Type:** `boolean`
- **Description:**  
  Reset validation status and reset form state to its initial state.  
  Initial state is different from the original state, as it can be mutated when using `$reset`. This serves as the base comparison for `$edited`.  
  ⚠️ This doesn't work if the state is a `reactive` object.

### `toOriginalState`
- **Type:** `boolean`
- **Description:**  
  Reset validation status and reset form state to its original state.  
  Original state is the unmutated state that was passed to the form when it was initialized.

### `toState`
- **Type:** `TState` or `() => TState`
- **Description:**  
  Reset validation status and reset form state to the given state. Also sets the new state as the new initial state.

### `clearExternalErrors`
- **Type:** `boolean`
- **Description:**  
  Clears the `$externalErrors` state back to an empty object.


```ts
r$.$reset(); // Only reset validation state, set the initialValue as the current value
```

```ts
r$.$reset({ toInitialState: true }); // Reset validation state and form state to initial state
```

```ts
r$.$reset({ toOriginalState: true }); // Reset validation state and form state to original state
```

```ts
r$.$reset({ toState: { email: 'test@test.com' } }); // Reset validation state and form state to the given state
```

```ts
r$.$reset({ clearExternalErrors: true }); // Clear $externalErrors state
```


## Exemple

```vue
<template>
  <input
    v-model="r$.$value.email"
    :class="{ valid: r$.email.$correct, error: r$.email.$error }"
    placeholder="Type your email"
  />
  <ul v-if="r$.$errors.email.length">
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>
  <div>
    <button type="button" @click="r$.$reset()">Reset validation state</button>
    <button type="button" @click="r$.$reset({ toInitialState: true })">Reset to initial state</button>
    <button type="button" @click="r$.$reset({ toOriginalState: true })">Reset to original state</button>
    <button type="button" @click="r$.$reset({ toState: { email: 'test@test.com' } })"
      >Reset to a given state</button
    >
    <button class="primary" type="button" @click="r$.$validate()">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';

const { r$ } = useRegle(
  { email: '' },
  {
    email: { required, minLength: minLength(4), email },
  }
);
</script>
```

<ResetBasic />