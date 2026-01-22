<template>
  <input v-model="r$.$value.scope5Record" class="scope5Record-input" />
</template>

<script setup lang="ts">
  import { useScope5Regle } from './scoped-config';
  import { z } from 'zod';

  const { r$ } = useScope5Regle({ scope5Record: '' }, z.object({ scope5Record: z.string().min(1) }), {
    id: 'scope5',
  });
</script>
