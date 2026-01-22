<template>
  <div class="demo-container">
    <div>
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
      <div class="button-list inline">
        <button type="button" @click="r$.$reset()">Reset validation state</button>
        <button type="button" @click="r$.$reset({ toInitialState: true })">Reset to initial state</button>
        <button type="button" @click="r$.$reset({ toOriginalState: true })">Reset to original state</button>
        <button type="button" @click="r$.$reset({ toState: { email: 'test@test.com' } })"
          >Reset to a given state</button
        >
        <button class="primary" type="button" @click="r$.$validate()">Submit</button>
        <code class="status" :status="r$.$correct"></code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { email, minLength, required } from '@regle/rules';

  const { r$ } = useRegle(
    { email: '' },
    {
      email: { required, minLength: minLength(4), email },
    }
  );
</script>
