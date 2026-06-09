<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.host" :field="r$.host" placeholder="my-server.example.com" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { hostname } from '@regle/rules';

  const { r$ } = useRegle({ host: '' }, { host: { hostname } });
</script>
