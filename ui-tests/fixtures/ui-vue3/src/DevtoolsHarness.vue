<template>
  <div class="devtools-harness">
    <h1>Regle devtools harness</h1>

    <label>
      Name
      <input v-model="r$.$value.name" data-testid="devtools-name" />
    </label>

    <p data-testid="devtools-name-invalid">{{ r$.name.$invalid }}</p>
    <p data-testid="devtools-name-dirty">{{ r$.name.$dirty }}</p>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { required } from '@regle/rules';
  import { ref } from 'vue';

  const form = ref({ name: '' });

  const { r$ } = useRegle(
    form,
    {
      name: { required },
    },
    { id: 'playwright-devtools-form' }
  );
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
