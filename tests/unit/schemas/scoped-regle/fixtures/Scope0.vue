<template>
  <input v-model="r$.$value.scope0Data" class="scope0-input" />
</template>

<script setup lang="ts">
import { useScopedRegleSchema } from '@regle/schemas';
import { z } from 'zod';

const { r$ } = useScopedRegleSchema({ scope0Data: '' }, z.object({ scope0Data: z.string().min(1) }));
</script>
