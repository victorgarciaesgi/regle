<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.text" :field="r$.text" placeholder="Must end with '.com'" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { endsWith } from '@regle/rules';

  const { r$ } = useRegle({ text: '' }, { text: { endsWith: endsWith('.com') } });
</script>
