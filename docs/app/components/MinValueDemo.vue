<template>
  <div class="demo-container">
    <DemoField
      v-model="r$.$value.inclusive"
      :field="r$.inclusive"
      type="number"
      label="minValue(1) (inclusive)"
      placeholder="≥ 1"
    />
    <DemoField
      v-model="r$.$value.exclusive"
      :field="r$.exclusive"
      type="number"
      label="minValue(1, { allowEqual: false }) (exclusive)"
      placeholder="> 1"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { minValue } from '@regle/rules';

  const { r$ } = useRegle(
    { inclusive: undefined as number | undefined, exclusive: undefined as number | undefined },
    {
      inclusive: { minValue: minValue(1) },
      exclusive: { minValue: minValue(1, { allowEqual: false }) },
    }
  );
</script>
