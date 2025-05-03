<template>
  <input v-model="r$.$value.scope5Record" class="scope5Record-input" />
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScope53Regle } from './scoped-config';

const props = defineProps<{
  scope: string;
}>();

const { r$ } = useScope53Regle({ scope5Record: '' }, { scope5Record: { required: required } }, { scopeKey: 'scope5' });
</script>
