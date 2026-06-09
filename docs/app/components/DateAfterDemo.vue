<template>
  <div class="demo-container">
    <DemoField
      v-model="r$.$value.inclusive"
      :field="r$.inclusive"
      type="date"
      label="dateAfter(today) (inclusive, allows equal)"
    />
    <DemoField
      v-model="r$.$value.exclusive"
      :field="r$.exclusive"
      type="date"
      label="dateAfter(today, { allowEqual: false }) (exclusive)"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { dateAfter } from '@regle/rules';

  const today = new Date();

  const { r$ } = useRegle(
    { inclusive: '', exclusive: '' },
    {
      inclusive: { dateAfter: dateAfter(today) },
      exclusive: { dateAfter: dateAfter(today, { allowEqual: false }) },
    }
  );
</script>
