<template>
  <div class="demo-container">
    <DemoField
      v-model="r$.$value.basic"
      :field="r$.basic"
      label="containsSpecialCharacter (at least 1)"
      placeholder="hello!"
    />
    <DemoField
      v-model="r$.$value.withCount"
      :field="r$.withCount"
      label="containsSpecialCharacter(2) (at least 2)"
      placeholder="hello!@"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { containsSpecialCharacter } from '@regle/rules';

  const { r$ } = useRegle(
    { basic: '', withCount: '' },
    {
      basic: { containsSpecialCharacter },
      withCount: { containsSpecialCharacter: containsSpecialCharacter(2) },
    }
  );
</script>
