<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.basic" :field="r$.basic" label="httpUrl" placeholder="http://example.com" />
    <DemoField
      v-model="r$.$value.httpsOnly"
      :field="r$.httpsOnly"
      label="httpUrl({ protocol: /^https$/ }) (HTTPS only)"
      placeholder="https://example.com"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { httpUrl } from '@regle/rules';

  const { r$ } = useRegle(
    { basic: '', httpsOnly: '' },
    {
      basic: { httpUrl },
      httpsOnly: { httpUrl: httpUrl({ protocol: /^https$/ }) },
    }
  );
</script>
