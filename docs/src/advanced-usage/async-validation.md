---
title: Async validations
---

<script setup>
  import AsyncRule from '../parts/components/rules/AsyncRule.vue';
</script>


# Async validation

A common pattern in forms is to asynchronously check for a value on the server side.
Async rules can perform these tasks, and they update the `$pending` state whenever invoked.


:::tip
By default, all async rules will be debounced by `200ms`. It can be overriden with the `$debounce` modifier.
:::

## Inline Async rule

To declare an async rule, you simply have to use the `async await` syntax.

```ts
const myAsyncRule = async (value: Maybe<number>) => {
  if (isFilled(value)) {
    return await someStuff();
  }
  return true;
}
```

If your rule doesn't use `async await` syntax, but still returns a `Promise`, you have to use the `withAsync` helper when using your rule in your form. Otherwise, Regle can't know it's an async rule.


## Async using `createRule`

In the same way of an inline rule, your validator function must be using `async await` to be declared as an async rule.

```ts
const myAsyncRule = createRule({
  async validator(value: Maybe<string>) {
    if (isFilled(value)) {
      return await someStuff();
    }
    return true;
  },
  message: 'Error'
})
```

## `$pending` property

Every time you update the `$value` of the field using an async rule, the `$pending` [validation property](/core-concepts/validation-properties#pending) will be updated. The `$error` status depends on `$pending` so a field cannot be errored if it's still pending.

This can be used to display a loading icon and a custom message indicating that an operation is taking time.


## Full example

```vue twoslash [App.vue]
<template>
  <div class="demo-container">
    <div>
      <input
        v-model="form.email"
        :class="{ pending: r$.$fields.email.$pending }"
        placeholder="Type your email"
      />

      <button type="button" @click="r$.$reset({toInitialState: true})">Reset</button>
      <button type="button" @click="r$.$validate">Submit</button>
    </div>

    <span v-if="r$.$fields.email.$pending"> Checking... </span>
    
    <ul v-if="r$.$errors.email.length">
      <li v-for="error of r$.$errors.email" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
function randomBoolean(): boolean {
  return [1, 2][Math.floor(Math.random() * 2)] === 1 ? true : false;
}

function timeout(count: number) {
  return new Promise((resolve) => setTimeout(resolve, count));
}
// ---cut---
import { createRule, useRegle, type Maybe } from '@regle/core';
import { email, isEmpty } from '@regle/rules';
import { ref } from 'vue';

const checkEmailExists = createRule({
  async validator(value: Maybe<string>) {
    if (isEmpty(value) || !email.exec(value)) {
      return true;
    }

    await timeout(1000);
    return randomBoolean();
  },
  
  message: 'This email already exists',
});

const form = ref({ email: '' });

const { r$ } = useRegle(form, {
  email: { email, checkEmailExists },
});
</script>
```


<AsyncRule/>
