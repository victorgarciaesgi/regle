<template>
  <div class="devtools-harness">
    <h1>Nested form devtools harness</h1>

    <label>
      Profile email
      <input v-model="r$.$value.profile.email" data-testid="nested-email" />
    </label>

    <p data-testid="nested-email-invalid">{{ r$.profile.email.$invalid }}</p>
    <p data-testid="nested-email-dirty">{{ r$.profile.email.$dirty }}</p>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { required } from '@regle/rules';
  import { ref } from 'vue';

  const form = ref({
    profile: {
      email: '',
    },
  });

  const { r$ } = useRegle(
    form,
    {
      profile: {
        email: { required },
      },
    },
    { id: 'playwright-devtools-nested' }
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
