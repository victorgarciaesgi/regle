<template>
  <div class="demo-container">
    <div>
      <input
        v-model="form.email"
        :class="{ valid: r$.$fields.email.$valid, pending: r$.$fields.email.$pending }"
        placeholder="Type your email"
      />
      <button type="button" @click="r$.$resetAll">Reset</button>
      <button type="button" @click="r$.$validate">Validate</button>
    </div>
    <span v-if="r$.$fields.email.$pending" class="pending-text"> Checking... </span>
    <ul v-if="r$.$errors.email.length">
      <li v-for="error of r$.$errors.email" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { createRule, useRegle, type Maybe } from '@regle/core';
import { email, ruleHelpers } from '@regle/rules';
import { ref } from 'vue';

function randomBoolean(): boolean {
  return [1, 2][Math.floor(Math.random() * 2)] === 1 ? true : false;
}

function timeout(count: number) {
  return new Promise((resolve) => setTimeout(resolve, count));
}

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
