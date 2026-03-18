<template>
  <div>
    <h1>Page 1</h1>
    <input v-model="r$.$value.name" placeholder="Name" />
    <div v-if="r$.$errors.name">
      <p v-for="error of r$.$errors.name" :key="error">{{ error }}</p>
    </div>
    <input v-model="r$.$value.email" placeholder="Email" />

    <div v-if="r$.$errors.email">
      <p v-for="error of r$.$errors.email" :key="error">{{ error }}</p>
    </div>
    <button @click="r$.$validate()">Validate</button>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '#imports';
  import type { RegleExternalErrorTree } from '@regle/core';
  import { email, required } from '@regle/rules';

  definePageMeta({
    middleware: [
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
    ],
  });

  const state = ref({
    name: '',
    email: '',
  });

  const externalErrors = ref<RegleExternalErrorTree<typeof state>>({});

  const { r$ } = useRegle(
    state,
    {
      name: {
        required,
      },
      email: {
        required,
        email: email,
      },
    },
    {
      externalErrors,
    }
  );
</script>
