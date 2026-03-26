<template>
  <div class="demo-container">
    <DemoField
      v-model="r$.$value.inclusive"
      :field="r$.inclusive"
      type="number"
      label="between(1, 10) (inclusive)"
      placeholder="1 to 10"
    />
    <DemoField
      v-model="r$.$value.exclusive"
      :field="r$.exclusive"
      type="number"
      label="between(1, 10, { allowEqual: false }) (exclusive)"
      placeholder="2 to 9"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { between } from '@regle/rules';

  const { r$ } = useRegle(
    { inclusive: undefined as number | undefined, exclusive: undefined as number | undefined },
    {
      inclusive: { between: between(1, 10) },
      exclusive: { between: between(1, 10, { allowEqual: false }) },
    }
  );
</script>
