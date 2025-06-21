<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.email"
        :class="{
          error: r$.email.$error,
          valid: r$.email.$correct,
        }"
        placeholder="Type your email"
      />
    </div>

    <ul v-if="r$.$errors.email.length">
      <li v-for="error of r$.$errors.email" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { required, email } from '@regle/rules';
import { useScopedRegle } from './scoped-config';

const { r$ } = useScopedRegle({ email: '' }, { email: { required, email } });
</script>
