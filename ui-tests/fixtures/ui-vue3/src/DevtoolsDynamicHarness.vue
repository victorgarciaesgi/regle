<template>
  <div class="devtools-harness">
    <h1>Dynamic forms devtools harness</h1>

    <button type="button" data-testid="dynamic-add-form-a" @click="formACount++">Add form A</button>
    <button type="button" data-testid="dynamic-add-form-b" @click="showFormB = true">Add form B</button>

    <DevtoolsDynamicFormA v-for="index in formACount" :key="`form-a-${index}`" :form-key="index" />
    <DevtoolsDynamicFormB v-if="showFormB" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import DevtoolsDynamicFormA from './DevtoolsDynamicFormA.vue';
  import DevtoolsDynamicFormB from './DevtoolsDynamicFormB.vue';

  const formACount = ref(1);
  const showFormB = ref(false);
</script>

<style scoped>
  .devtools-harness {
    display: grid;
    gap: 1rem;
    max-width: 40rem;
    margin: 2rem auto;
    padding: 1rem;
  }
</style>
