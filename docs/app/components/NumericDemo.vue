<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.count" :field="r$.count" placeholder='Enter a number (42 or "42")' />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { numeric } from '@regle/rules';

  const { r$ } = useRegle({ count: '' }, { count: { numeric } });
</script>
