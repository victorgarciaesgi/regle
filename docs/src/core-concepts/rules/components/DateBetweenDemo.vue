<template>
  <div class="demo-container">
    <DemoField
      v-model="r$.$value.inclusive"
      :field="r$.inclusive"
      type="date"
      label="dateBetween(start, end) (inclusive)"
    />
    <DemoField
      v-model="r$.$value.exclusive"
      :field="r$.exclusive"
      type="date"
      label="dateBetween(start, end, { allowEqual: false }) (exclusive)"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { dateBetween } from '@regle/rules';

  const start = new Date();
  const end = new Date(2030, 11, 31);

  const { r$ } = useRegle(
    { inclusive: '', exclusive: '' },
    {
      inclusive: { dateBetween: dateBetween(start, end) },
      exclusive: { dateBetween: dateBetween(start, end, { allowEqual: false }) },
    }
  );
</script>
