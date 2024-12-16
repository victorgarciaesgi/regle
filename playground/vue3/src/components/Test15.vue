<template>
  <CompA v-if="condition" />
  <CompoB v-else />
  <button type="button" @click="handleToggle">Toggle</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CompA from './tests-pinia/CompA.vue';
import CompoB from './tests-pinia/CompoB.vue';
import { useTestStore } from '@/stores/test.store';
// import { useTestStore } from '@/stores/test.store';

const condition = ref(false);
const store = useTestStore();

function handleToggle() {
  if (!condition.value) {
    store.$dispose();
  }
  condition.value = !condition.value;
}
</script>
