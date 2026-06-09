<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.price" :field="r$.price" placeholder="Enter a decimal (3.14)" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { decimal } from '@regle/rules';

  const { r$ } = useRegle({ price: '' }, { price: { decimal } });
</script>
