<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.count" :field="r$.count" placeholder="Enter an integer (42)" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { integer } from '@regle/rules';

  const { r$ } = useRegle({ count: '' }, { count: { integer } });
</script>
