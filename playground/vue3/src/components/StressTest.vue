<template>
  <div>
    <input v-model="r$.$value._track" placeholder="name" />
  </div>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod/v4';
import { ref } from 'vue';

// Generate an object with 16k keys: key0, key1, ..., key15999
const r$form = ref(
  (() => {
    const obj: Record<string, any> = {};
    for (let i = 0; i < 16000; i++) {
      obj[`key${i}`] = '';
    }
    obj._track = '';
    return obj;
  })()
);

const { r$ } = useRegleSchema(
  r$form,
  z.object({
    _track: z.any(), // dummy field
  }),
  {
    silent: true,
    syncState: {
      onUpdate: true,
      onValidate: true,
    },
  }
);
</script>
