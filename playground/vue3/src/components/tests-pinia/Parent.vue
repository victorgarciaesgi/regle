<template>
  <CompA v-if="condition" />
  <CompoB v-else />
  <button @click="handleToggle">Toogle</button>
</template>

<script setup lang="ts">
  import { useTestStore } from '@/stores/test.store';
  import { ref } from 'vue';
  import CompoB from './CompoB.vue';
  import CompA from './CompA.vue';

  const condition = ref(true);
  const store = useTestStore();

  function handleToggle() {
    if (!condition.value) {
      store.$dispose();
    }
    condition.value = !condition.value;
  }
</script>

<style lang="scss" scoped></style>
