<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.email" :field="r$.email" placeholder="user@example.com" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { email } from '@regle/rules';

  const { r$ } = useRegle({ email: '' }, { email: { email } });
</script>
