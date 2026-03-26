<template>
  <div class="demo-container">
    <DemoField
      v-model="r$.$value.inclusive"
      :field="r$.inclusive"
      type="number"
      label="maxValue(100) (inclusive)"
      placeholder="≤ 100"
    />
    <DemoField
      v-model="r$.$value.exclusive"
      :field="r$.exclusive"
      type="number"
      label="maxValue(100, { allowEqual: false }) (exclusive)"
      placeholder="< 100"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { maxValue } from '@regle/rules';

  const { r$ } = useRegle(
    { inclusive: undefined as number | undefined, exclusive: undefined as number | undefined },
    {
      inclusive: { maxValue: maxValue(100) },
      exclusive: { maxValue: maxValue(100, { allowEqual: false }) },
    }
  );
</script>
