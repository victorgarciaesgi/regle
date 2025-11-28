<template>
  <input v-model="r$.$value.email" placeholder="Type your email" />
  <ul>
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { required, email } from '@regle/rules';
import { useScopedRegle } from './scope-config';

const { r$ } = useScopedRegle(
  { email: '' },
  { email: { required, email } },
  { namespace: 'persons', scopeKey: 'child1' }
);
</script>
