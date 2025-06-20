<template>
  <div v-if="narrowVariant(r$, 'type', 'EMAIL')">
    <!-- `email` is a known field only in this block -->
    <input v-model="r$.email.$value" placeholder="Email" />
    <Errors :errors="r$.email.$errors" />
  </div>

  <div v-else-if="narrowVariant(r$, 'type', 'GITHUB')">
    <!-- `username` is a known field only in this block -->
    <input v-model="r$.username.$value" placeholder="Email" />
    <Errors :errors="r$.username.$errors" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { literal, required, email } from '@regle/rules';
type FormStateLoginType =
  | { type: 'EMAIL'; email: string }
  | { type: 'GITHUB'; username: string }
  | { type?: undefined };

type FormState = {
  firstName?: string;
  lastName?: string;
} & FormStateLoginType;

// ---cut---
import { useRegle, createVariant, narrowVariant, variantToRef } from '@regle/core';

const state = ref<FormState>({});

const { r$ } = useRegle(state, () => {
  const variant = createVariant(state, 'type', [
    { type: { literal: literal('EMAIL') }, email: { required, email } },
    { type: { literal: literal('GITHUB') }, username: { required } },
    { type: { required } },
  ]);

  return {
    firstName: { required },
    ...variant.value,
  };
});

const variantRef = variantToRef(r$, 'type', 'EMAIL');
</script>
