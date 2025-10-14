<script setup lang="ts">
import { ref } from 'vue';
import StressTest from './StressTest.vue';

const show = ref(false);
</script>

<template>
  <StressTest v-if="show" />
  <button @click="show = !show">Show</button>
</template>
