<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.basic" :field="r$.basic" label="containsUppercase (at least 1)" placeholder="Hello" />
    <DemoField
      v-model="r$.$value.withCount"
      :field="r$.withCount"
      label="containsUppercase(2) (at least 2)"
      placeholder="HeLLo"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { containsUppercase } from '@regle/rules';

  const { r$ } = useRegle(
    { basic: '', withCount: '' },
    {
      basic: { containsUppercase },
      withCount: { containsUppercase: containsUppercase(2) },
    }
  );
</script>
