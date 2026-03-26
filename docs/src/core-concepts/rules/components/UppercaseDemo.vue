<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.name" :field="r$.name" placeholder="UPPERCASE ONLY" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { uppercase } from '@regle/rules';

  const { r$ } = useRegle({ name: '' }, { name: { uppercase } });
</script>
