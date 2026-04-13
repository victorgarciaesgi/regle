<script setup>
  import Comp from './Comp.vue';
  import { ref } from 'vue';

  const toggle = ref(true);

  const toggleComponent = () => {
    toggle.value = !toggle.value;
  };
</script>

<template>
  <button @click="toggleComponent">Toggle Validation Component</button>
  <Comp v-if="toggle" />
</template>
