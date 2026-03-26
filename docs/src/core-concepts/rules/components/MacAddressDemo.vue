<template>
  <div class="demo-container">
    <DemoField
      v-model="r$.$value.defaultSep"
      :field="r$.defaultSep"
      label="macAddress (default separator :)"
      placeholder="00:1B:44:11:3A:B7"
    />
    <DemoField
      v-model="r$.$value.dashSep"
      :field="r$.dashSep"
      label="macAddress('-') (dash separator)"
      placeholder="00-1B-44-11-3A-B7"
    />
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { macAddress } from '@regle/rules';

  const { r$ } = useRegle(
    { defaultSep: '', dashSep: '' },
    {
      defaultSep: { macAddress },
      dashSep: { macAddress: macAddress('-') },
    }
  );
</script>
