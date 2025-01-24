<template>
  <input v-model="r$.$value.scope1Data" class="scope1-input" />
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { useScoped1Regle } from './scoped-config';

const { r$ } = useScoped1Regle({ scope1Data: '' }, { scope1Data: { required } });
</script>
