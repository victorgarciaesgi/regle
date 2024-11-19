<template>
  <div class="demo-container">
    <div>
      <input
        v-model="state.name"
        :class="{ valid: regle.$fields.name.$valid, error: regle.$fields.name.$error }"
        placeholder="Type your name"
      />
      <button type="button" @click="resetAll">Reset</button>
    </div>
    <ul v-if="errors.name.length">
      <li v-for="error of errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const useCustomRegle = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, (value, { $params: [count] }) => {
      return `Minimum length is ${count}. Current length: ${value?.length}`;
    }),
  }),
});

const { errors, state, regle, resetAll } = useCustomRegle(
  { name: '' },
  {
    name: {
      required,
      minLength: minLength(6),
    },
  }
);
</script>
