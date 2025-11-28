<template>
  <input v-model="r$.$value.firstName" placeholder="Type your firstname" />
  <ul>
    <li v-for="error of r$.$errors.firstName" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScopedRegle } from './scope-config';

const { r$ } = useScopedRegle(
  { firstName: '' },
  { firstName: { required } },
  { namespace: 'contacts', scopeKey: 'child2' }
);
</script>
