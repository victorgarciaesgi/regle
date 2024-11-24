<template>
  <div class="my-input input-container">
    <label v-if="label">{{ label }}</label>
    <input
      v-model="modelValue"
      :class="{ valid: field.$valid, error: field.$error, pending: field.$pending }"
      :placeholder="placeholder"
    />
    <span v-if="field.$pending" class="pending-text"> Checking... </span>
    <ul v-if="field.$errors.length">
      <li v-for="error of field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Maybe, RegleFieldStatus } from '@regle/core';

const modelValue = defineModel<Maybe<string>>();

defineProps<{
  field: RegleFieldStatus;
  label?: string;
  placeholder: string;
}>();
</script>

<style lang="scss" scoped></style>
