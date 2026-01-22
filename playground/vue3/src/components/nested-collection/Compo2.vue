<template>
  <label>Compo 2 (Should NOT be collected): </label>
  <input v-model="r$.$value.dataFromCompo2" placeholder="dataFromCompo2" />
  <ul>
    <li v-for="error of r$.$errors.dataFromCompo2" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { required } from '@regle/rules';
  import { useRegle } from '@regle/core';

  const { r$ } = useRegle({ dataFromCompo2: '' }, { dataFromCompo2: { required: required } });
</script>

<style lang="scss" scoped></style>
