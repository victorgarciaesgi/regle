<template>
  <div>{{ r$.$fields.name.$value }}</div>
</template>

<script setup lang="ts">
import { required } from '@regle/rules';

const { r$ } = useRegle({ name: 'hello' }, { name: { required: withMessage(required, 'foo') } });
</script>

<style lang="scss" scoped></style>
