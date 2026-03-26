<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.basic" :field="r$.basic" label="alpha" placeholder="Letters only (abc)" />
    <DemoField
      v-model="r$.$value.withSymbols"
      :field="r$.withSymbols"
      label="alpha({ allowSymbols: true })"
      placeholder="Letters & symbols ([A-Za-z_]) "
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { alpha } from '@regle/rules';

  const { r$ } = useRegle(
    { basic: '', withSymbols: '' },
    {
      basic: { alpha },
      withSymbols: { alpha: alpha({ allowSymbols: true }) },
    }
  );
</script>
