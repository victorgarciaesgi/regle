<template>
  <div class="my-input input-container">
    <div style="width: 100%">
      <input
        v-model="modelValue"
        type="checkbox"
        :class="{ valid: field.$valid, error: field.$error, $pending: field.$pending }"
      />
      <label>{{ placeholder }}<span v-if="isRequired" class="required-mark">*</span></label>
    </div>
    <ul v-if="field.$errors.length">
      <li v-for="error of field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Maybe, RegleFieldStatus } from '@regle/core';
import { computed } from 'vue';

const modelValue = defineModel<boolean>();

const props = defineProps<{
  field: RegleFieldStatus<boolean>;
  placeholder: string;
}>();

const isRequired = computed(() => {
  return props.field.$rules.required?.$active ?? false;
});
</script>

<style lang="scss" scoped>
.my-input {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 8px;

  label {
    margin-bottom: 0;
  }
}
</style>
