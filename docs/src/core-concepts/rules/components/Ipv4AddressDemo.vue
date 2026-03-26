<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.address" :field="r$.address" placeholder="127.0.0.1" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { ipv4Address } from '@regle/rules';

  const { r$ } = useRegle({ address: '' }, { address: { ipv4Address } });
</script>
