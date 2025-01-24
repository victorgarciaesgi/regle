<template>
  <input v-model="r$.$value.scope1Namespace" class="scope1Namespace-input" />
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScoped1Regle } from './scoped-config';

const props = defineProps<{
  scope: string;
}>();

const { r$ } = useScoped1Regle(
  { scope1Namespace: '' },
  { scope1Namespace: { required: required } },
  { namespace: () => props.scope }
);
</script>
