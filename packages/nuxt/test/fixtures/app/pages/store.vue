<template>
  <div> {{ r$.name.$dirty }} </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useTestStore } from '../test.store';

  const testStore = useTestStore();
  const { r$ } = storeToRefs(testStore);
</script>
