<template>
  <input v-model="r$.$value.scope1Namespace" class="scope1Namespace-input" />
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useScoped1Regle } from './scoped-config';

  const props = defineProps<{
    scope: string;
  }>();

  const { r$ } = useScoped1Regle({ scope1Namespace: '' }, z.object({ scope1Namespace: z.string().nonempty() }), {
    namespace: () => props.scope,
  });
</script>
