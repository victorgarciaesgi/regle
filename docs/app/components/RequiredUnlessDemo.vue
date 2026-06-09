<template>
  <div class="demo-container">
    <div class="block">
      <label>
        <input v-model="condition" type="checkbox" />
        Disable required
      </label>
    </div>
    <DemoField v-model="r$.$value.name" :field="r$.name" placeholder="Required unless checked" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { requiredUnless } from '@regle/rules';

  const condition = ref(false);

  const { r$ } = useRegle(
    { name: '' },
    {
      name: { required: requiredUnless(condition) },
    }
  );
</script>
