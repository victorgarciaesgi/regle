<script setup lang="ts">
import { useRegle, createVariant, narrowVariant } from '@regle/core';
import { literal, required, email } from '@regle/rules';
import { ref } from 'vue';

type FormStateLoginType =
  | { type: 'EMAIL'; email: string }
  | { type: 'GITHUB'; username: string }
  | { type?: undefined };

type FormState = {
  firstName?: string;
  lastName?: string;
} & FormStateLoginType;

const state = ref<FormState>({});

// ⚠️ Use getter syntax for your rules () => {} or a computed one
const { r$ } = useRegle(state, () => {
  /**
   * Here you create you rules variations, see each member as a `OR`
   * `type` here is the discriminant
   *
   * Depending of the value of `type`, Regle will apply the corresponding rules.
   */
  const variant = createVariant(state, 'type', [
    { type: { literal: literal('EMAIL') }, email: { required, email } },
    { type: { literal: literal('GITHUB') }, username: { required } },
    { type: { required } },
  ]);

  return {
    firstName: { required },
    // Don't forget to return the computed rules
    ...variant.value,
  };
});
</script>

<template>
  <input v-model="r$.firstName.$value" placeholder="First name" />
  <Errors :errors="r$.firstName.$errors" />

  <select v-model="r$.type.$value">
    <option disabled value="">Account type</option>
    <option value="EMAIL">Email</option>
    <option value="GITHUB">Github</option>
  </select>

  <div v-if="narrowVariant(r$, 'type', 'EMAIL')">
    <!-- `email` is now a known field in this block -->
    <input v-model="r$.email.$value" placeholder="Email" />
    <Errors :errors="r$.email.$errors" />
  </div>

  <div v-else-if="narrowVariant(r$, 'type', 'GITHUB')">
    <!-- `username` is now a known field in this block -->
    <input v-model="r$.username.$value" placeholder="Email" />
    <Errors :errors="r$.username.$errors" />
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>
