<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.name" :field="r$.name" placeholder="This field is required" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { required } from '@regle/rules';

  const { r$ } = useRegle({ name: '' }, { name: { required } });
</script>
