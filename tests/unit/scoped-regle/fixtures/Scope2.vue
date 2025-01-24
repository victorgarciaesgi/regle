<template>
  <input v-model="r$.$value.scope2Data" class="scope2-input" />
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScoped2Regle } from './scoped-config';

const { r$ } = useScoped2Regle({ scope2Data: '' }, { scope2Data: { required } });
</script>
