<template>
  <input v-model="r$.$value.scope4Namespace" class="scope4Namespace-input" />
</template>

<script setup lang="ts">
  import { required } from '@regle/rules';
  import { useScoped1Regle } from './scoped-config';

  const props = defineProps<{
    scope: string;
  }>();

  const { r$ } = useScoped1Regle(
    { scope4Namespace: '' },
    { scope4Namespace: { required: required } },
    { namespace: () => props.scope }
  );
</script>
