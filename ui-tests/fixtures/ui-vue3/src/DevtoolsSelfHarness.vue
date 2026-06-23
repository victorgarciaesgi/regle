<template>
  <div class="devtools-harness">
    <h1>Object $self devtools harness</h1>

    <p data-testid="self-user-invalid">{{ r$.user.$invalid }}</p>
    <p data-testid="self-user-self-invalid">{{ r$.user.$self.$invalid }}</p>
    <button type="button" data-testid="self-set-user" @click="setValidUser">Set valid user</button>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { atLeastOne, required } from '@regle/rules';
  import { ref } from 'vue';

  const form = ref<{
    user?: { firstName: string; lastName: string };
  }>({});

  const { r$ } = useRegle(
    form,
    {
      user: {
        $self: { required, atLeastOne },
      },
    },
    { id: 'playwright-devtools-self' }
  );

  function setValidUser() {
    form.value.user = { firstName: 'John', lastName: 'Doe' };
  }
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
