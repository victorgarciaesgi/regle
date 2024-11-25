<template>
  <div class="demo-container">
    <div>
      <input
        v-model="state.email"
        :class="{ valid: r$.$fields.email.$valid, error: r$.$fields.email.$error }"
        placeholder="Type your email"
      />
      <button type="button" @click="resetAll">Reset</button>
    </div>
    <ul v-if="r$.$errors.email.length">
      <li v-for="error of r$.$errors.email" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';

const { r$, state, resetAll } = useRegle(
  { email: '' },
  {
    email: { required, minLength: minLength(4), email },
  }
);
</script>
