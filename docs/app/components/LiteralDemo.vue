<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.value" :field="r$.value" placeholder="Type exactly 'regle'" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { literal } from '@regle/rules';

  const { r$ } = useRegle({ value: '' }, { value: { literal: literal('regle') } });
</script>
