<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.name"
        :class="{ valid: r$.name.$correct, error: r$.name.$error }"
        placeholder="Type your name"
      />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>

    <ul v-if="r$.$errors.name.length">
      <li v-for="error of r$.$errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, ({ $value, $params: [count] }) => {
      return `Minimum length is ${count}. Current length: ${$value?.length}`;
    }),
  }),
});

const { r$ } = useCustomRegle(
  { name: '' },
  {
    name: {
      required,
      minLength: minLength(6),
    },
  }
);
</script>
