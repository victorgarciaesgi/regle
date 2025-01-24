<template>
  <input v-model="r$.$value.scope3Data" class="scope3-input" />
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScoped3Regle } from './scoped-config';

const { r$ } = useScoped3Regle({ scope3Data: '' }, { scope3Data: { myCustomRule: required } });
</script>
