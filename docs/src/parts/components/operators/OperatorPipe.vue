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
      <p v-if="r$.email.$rules.minLength.$valid">✓ MinLength passed</p>
      <p v-if="r$.email.$rules.email.$valid">✓ Email format passed</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { pipe, required, minLength, email } from '@regle/rules';

  const { r$ } = useRegle(
    { email: '' },
    {
      email: pipe(required, minLength(5), email),
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
</style>
