<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.emoji" :field="r$.emoji" placeholder="Enter an emoji 😊" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { emoji } from '@regle/rules';

  const { r$ } = useRegle({ emoji: '' }, { emoji: { emoji } });
</script>
