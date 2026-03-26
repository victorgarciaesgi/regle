<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.digits" :field="r$.digits" placeholder="Exactly 6 digits (123456)" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { exactDigits } from '@regle/rules';

  const { r$ } = useRegle({ digits: '' }, { digits: { exactDigits: exactDigits(6) } });
</script>
