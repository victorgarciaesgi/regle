<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.email"
        :class="{
          error: r$.$fields.email.$error,
          valid: r$.$fields.email.$correct,
        }"
        placeholder="Type your email"
      />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
      <code class="status" :status="!r$.$invalid"></code>
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

const { r$ } = useRegle(
  { email: '' },
  {
    email: { required, minLength: minLength(4), email },
  }
);
</script>
