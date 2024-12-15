---
title: Async validations
---

<script setup>
  import AsyncRule from '../parts/components/rules/AsyncRule.vue';
</script>


# Async validation

A common pattern in forms is to asynchronously check for a value on the serveride.
Async rules can perform this tasks, and they update the `$pending` state whenever invoked.

```vue twoslash [App.vue]
<template>
  <div class="demo-container">
    <div>
      <input
        v-model="form.email"
        :class="{ pending: r$.$fields.email.$pending }"
        placeholder="Type your email"
      />

      <button type="button" @click="r$.$resetAll">Reset</button>
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
import { email, ruleHelpers } from '@regle/rules';
import { ref } from 'vue';

const checkEmailExists = createRule({
  async validator(value: Maybe<string>) {
    if (ruleHelpers.isEmpty(value) || !email.exec(value)) {
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