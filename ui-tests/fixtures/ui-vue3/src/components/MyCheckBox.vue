<template>
  <div class="my-input input-container">
    <input
      v-model="modelValue"
      type="checkbox"
      :class="{ valid: field.$valid, error: field.$error, $pending: field.$pending }"
    />
    <label>{{ placeholder }}</label>
    <ul v-if="field.$errors.length">
      <li v-for="error of field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { RegleFieldStatus } from '@regle/core';

const modelValue = defineModel<boolean>();

defineProps<{
  field: RegleFieldStatus<boolean>;
  placeholder: string;
}>();
</script>
