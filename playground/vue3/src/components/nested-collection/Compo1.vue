<template>
  <label>Compo 1 (Should collected): </label>
  <input v-model="r$.$value.nameFromCompo1" placeholder="nameFromCompo1" />
  <ul>
    <li v-for="error of r$.$errors.nameFromCompo1" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScopedRegle } from './config';

const { r$ } = useScopedRegle(
  { nameFromCompo1: '' },
  { nameFromCompo1: { required: required } },
  { namespace: 'foo', scopeKey: 'compo1' }
);
</script>

<style lang="scss" scoped></style>
