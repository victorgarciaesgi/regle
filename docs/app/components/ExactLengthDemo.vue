<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.code" :field="r$.code" placeholder="Exactly 5 characters" />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { exactLength } from '@regle/rules';

  const { r$ } = useRegle({ code: '' }, { code: { exactLength: exactLength(5) } });
</script>
