<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.basic" :field="r$.basic" label="url" placeholder="https://example.com" />
    <DemoField
      v-model="r$.$value.httpOnly"
      :field="r$.httpOnly"
      label="url({ protocol: /^https?$/ }) (HTTP/HTTPS only)"
      placeholder="https://example.com"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { url } from '@regle/rules';

  const { r$ } = useRegle(
    { basic: '', httpOnly: '' },
    {
      basic: { url },
      httpOnly: { url: url({ protocol: /^https?$/ }) },
    }
  );
</script>
