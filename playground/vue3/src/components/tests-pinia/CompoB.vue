<template>
  <div>{{ testForm.r$ }}</div>
</template>

<script setup lang="ts">
import { useTestStore } from '@/stores/test.store';

const testForm = useTestStore();
testForm.r$.$reset();
</script>

<style lang="scss" scoped></style>
