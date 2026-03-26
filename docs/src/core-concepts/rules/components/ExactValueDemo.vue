<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.count" :field="r$.count" type="number" placeholder="Must equal 42" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { exactValue } from '@regle/rules';

  const { r$ } = useRegle({ count: undefined as number | undefined }, { count: { exactValue: exactValue(42) } });
</script>
