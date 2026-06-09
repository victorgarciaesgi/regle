<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.text" :field="r$.text" placeholder="Must start with 'Hello'" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { startsWith } from '@regle/rules';

  const { r$ } = useRegle({ text: '' }, { text: { startsWith: startsWith('Hello') } });
</script>
