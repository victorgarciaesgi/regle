<template>
  <input v-model="r$.$value.scope5Record" class="scope5Record-input" />
</template>

<script setup lang="ts">
  import { required } from '@regle/rules';
  import { useScope5Regle } from './scoped-config';

  const { r$ } = useScope5Regle({ scope5Record: '' }, { scope5Record: { required: required } }, { id: 'scope5' });
</script>
