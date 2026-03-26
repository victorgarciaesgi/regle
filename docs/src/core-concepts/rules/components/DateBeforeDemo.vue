<template>
  <div class="demo-container">
    <DemoField
      v-model="r$.$value.inclusive"
      :field="r$.inclusive"
      type="date"
      label="dateBefore(today) (inclusive, allows equal)"
    />
    <DemoField
      v-model="r$.$value.exclusive"
      :field="r$.exclusive"
      type="date"
      label="dateBefore(today, { allowEqual: false }) (exclusive)"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { dateBefore } from '@regle/rules';

  const today = new Date();

  const { r$ } = useRegle(
    { inclusive: '', exclusive: '' },
    {
      inclusive: { dateBefore: dateBefore(today) },
      exclusive: { dateBefore: dateBefore(today, { allowEqual: false }) },
    }
  );
</script>
