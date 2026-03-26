<template>
  <div class="demo-container">
    <div class="block">
      <label>
        <input v-model="condition" type="checkbox" />
        Enable required
      </label>
    </div>
    <DemoField v-model="r$.$value.name" :field="r$.name" placeholder="Required when checked" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { requiredIf } from '@regle/rules';

  const condition = ref(false);

  const { r$ } = useRegle(
    { name: '' },
    {
      name: { required: requiredIf(condition) },
    }
  );
</script>
