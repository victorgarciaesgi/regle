<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.domain" :field="r$.domain" placeholder="example.com" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { domain } from '@regle/rules';

  const { r$ } = useRegle({ domain: '' }, { domain: { domain } });
</script>
