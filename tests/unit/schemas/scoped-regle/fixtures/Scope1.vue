<template>
  <input v-model="r$.$value.scope1Data" class="scope1-input" />
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useScoped1Regle } from './scoped-config';

  const { r$ } = useScoped1Regle({ scope1Data: '' }, z.object({ scope1Data: z.string().min(1) }));
</script>
