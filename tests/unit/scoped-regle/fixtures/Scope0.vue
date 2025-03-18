<template>
  <input v-model="r$.$value.scope0Data" class="scope0-input" />
</template>

<script setup lang="ts">
import { useScopedRegle } from '@regle/core';
import { required } from '@regle/rules';

const { r$ } = useScopedRegle({ scope0Data: '' }, { scope0Data: { required } });
</script>
