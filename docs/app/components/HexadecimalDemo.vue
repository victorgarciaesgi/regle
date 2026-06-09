<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.hex" :field="r$.hex" placeholder="Enter hex value (ff00aa)" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { hexadecimal } from '@regle/rules';

  const { r$ } = useRegle({ hex: '' }, { hex: { hexadecimal } });
</script>
