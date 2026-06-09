<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.name" :field="r$.name" placeholder="Min 3 characters" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { minLength } from '@regle/rules';

  const { r$ } = useRegle({ name: '' }, { name: { minLength: minLength(3) } });
</script>
