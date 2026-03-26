<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.basic" :field="r$.basic" label="alphaNum" placeholder="Letters & numbers (abc123)" />
    <DemoField
      v-model="r$.$value.withSymbols"
      :field="r$.withSymbols"
      label="alphaNum({ allowSymbols: true })"
      placeholder="Letters, numbers & symbols ([A-Za-z0-9_])"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { alphaNum } from '@regle/rules';

  const { r$ } = useRegle(
    { basic: '', withSymbols: '' },
    {
      basic: { alphaNum },
      withSymbols: { alphaNum: alphaNum({ allowSymbols: true }) },
    }
  );
</script>
