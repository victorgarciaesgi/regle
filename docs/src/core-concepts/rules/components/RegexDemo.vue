<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.text" :field="r$.text" placeholder="Match /^[A-Z]{3}-\d{3}$/ (e.g. ABC-123)" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { regex } from '@regle/rules';

  const { r$ } = useRegle({ text: '' }, { text: { regex: regex(/^[A-Z]{3}-\d{3}$/) } });
</script>
