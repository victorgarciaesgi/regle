<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.name" :field="r$.name" placeholder="lowercase only" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { lowercase } from '@regle/rules';

  const { r$ } = useRegle({ name: '' }, { name: { lowercase } });
</script>
