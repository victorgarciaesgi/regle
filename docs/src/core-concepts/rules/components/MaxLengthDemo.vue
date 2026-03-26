<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.name" :field="r$.name" placeholder="Max 10 characters" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { maxLength } from '@regle/rules';

  const { r$ } = useRegle({ name: '' }, { name: { maxLength: maxLength(10) } });
</script>
