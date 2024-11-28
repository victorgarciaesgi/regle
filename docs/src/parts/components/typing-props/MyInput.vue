<template>
  <div class="my-input input-container">
    <input
      v-model="modelValue"
      :class="{ valid: field.$valid, error: field.$error }"
      :placeholder="placeholder"
      :name="field.$name"
    />
    <ul v-if="field.$errors.length">
      <li v-for="error of field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { RegleFieldStatus } from '@regle/core';

const modelValue = defineModel<string>();

defineProps<{
  field: RegleFieldStatus<string>;
  placeholder: string;
}>();
</script>
