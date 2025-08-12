<script setup lang="ts">
import { createVariant, defineRules, narrowVariant, refineRules, useRegle, type InferInput } from '@regle/core';
import { email, literal, minLength, minValue, numeric, required, sameAs, type } from '@regle/rules';
import { computed, ref } from 'vue';
import Errors from './Errors.vue';

const rules = refineRules(
  {
    firstName: { required },
    password: { required, type: type<string>() },
    type: { type: type<'ONE' | 'TWO' | undefined>() },
  },
  (state) => {
    const variant = createVariant(state, 'type', [
      { type: { literal: literal('TWO') }, twoValue: { numeric, required } },
      {
        type: { literal: literal('ONE') },
        oneValue: { numeric, required, minValue: minValue(4) },
      },
      { type: { required, type: type<undefined>() } },
    ]);

    return {
      confirmPassword: { required, sameAs: sameAs(() => state.value.password) },
      ...variant.value,
    };
  }
);

const state = ref<InferInput<typeof rules>>({});

const { r$ } = useRegle(state, rules);
</script>

<template>
  <select v-model="r$.type.$value">
    <option disabled value="">Account type</option>
    <option value="ONE">One</option>
    <option value="TWO">Two</option>
  </select>

  <div v-if="narrowVariant(r$.$fields, 'type', 'ONE')">
    <!-- `email` is now a known field in this block -->
    <input v-model="r$.oneValue.$value" placeholder="oneValue" />
    <Errors :errors="r$.oneValue.$errors" />
  </div>

  <div v-else-if="narrowVariant(r$.$fields, 'type', 'TWO')">
    <!-- `username` is now a known field in this block -->
    <!-- <input v-model="r$.twoValue.$value" placeholder="twoValue" />
    <Errors :errors="r$.twoValue.$errors" /> -->
  </div>
</template>
