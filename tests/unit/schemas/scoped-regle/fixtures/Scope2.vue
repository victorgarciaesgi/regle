<template>
  <input v-model="r$.$value.scope2Data" class="scope2-input" />
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useScoped2Regle } from './scoped-config';

  const { r$ } = useScoped2Regle({ scope2Data: '' }, z.object({ scope2Data: z.string().min(1) }));
</script>
