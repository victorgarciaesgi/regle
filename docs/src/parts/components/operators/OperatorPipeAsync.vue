<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.email"
        :class="{ valid: r$.email.$correct, error: r$.email.$error }"
        placeholder="Enter a valid email"
      />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate()">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>

    <ul v-if="r$.$errors.email.length">
      <li v-for="error of r$.$errors.email" :key="error">
        {{ error }}
      </li>
    </ul>

    <div class="info" v-if="r$.email.$dirty">
      <p v-if="r$.email.$rules.required.$valid">✓ Required passed</p>
      <p v-if="r$.email.$rules.email.$active && r$.email.$rules.email.$valid">✓ Email format passed</p>
      <p class="pending-text" v-if="r$.email.$pending">⏳ Checking availability...</p>
      <p v-else-if="r$.email.$rules.checkEmailAvailable.$active && r$.email.$rules.checkEmailAvailable.$valid"
        >✓ Email available</p
      >
    </div>

    <p class="hint">Try "taken@example.com" to see a taken email error</p>
  </div>
</template>

<script setup lang="ts">
  import { createRule, useRegle, type Maybe } from '@regle/core';
  import { pipe, required, email, withAsync, withMessage } from '@regle/rules';

  const checkEmailAvailable = createRule({
    type: 'checkEmailAvailable',
    async validator(value: Maybe<string>) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return value !== 'taken@example.com';
    },
    message: 'This email is already taken',
  });

  const { r$ } = useRegle(
    { email: '' },
    {
      email: pipe([required, email, checkEmailAvailable], { debounce: 300 }),
    }
  );
</script>

<style scoped>
  .info {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
  }
  .info p {
    margin: 0.25rem 0;
  }
  .hint {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--vp-c-text-3);
    font-style: italic;
  }
</style>
