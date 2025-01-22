<template>
  <label>Compo 3 (Should be collected): </label>
  <input v-model="r$.$value.countFromCompo3" placeholder="countFromCompo3" />
  <ul>
    <li v-for="error of r$.$errors.countFromCompo3" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { minValue, numeric, required } from '@regle/rules';
import { useScopedRegle } from './config';

const { r$ } = useScopedRegle(
  { countFromCompo3: 0 },
  { countFromCompo3: { required, numeric, minValue: minValue(4) } }
);
</script>

<style lang="scss" scoped></style>
