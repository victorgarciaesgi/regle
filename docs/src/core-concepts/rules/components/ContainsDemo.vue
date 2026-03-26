<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.text" :field="r$.text" placeholder="Must contain 'regle'" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { contains } from '@regle/rules';

  const { r$ } = useRegle({ text: '' }, { text: { contains: contains('regle') } });
</script>
