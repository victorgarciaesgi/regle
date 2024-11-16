<template>
  <div class="demo-container">
    <div>
      <input
        v-model="state.email"
        :class="{ valid: regle.$fields.email.$valid }"
        placeholder="Type your email"
      />
      <button type="button" @click="resetAll">Reset</button>
    </div>
    <ul v-if="errors.email.length">
      <li v-for="error of errors.email" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';
import { ref } from 'vue';

const { errors, regle, state, resetAll } = useRegle(
  { email: '' },
  {
    email: { required, minLength: minLength(4), email },
  }
);
</script>
