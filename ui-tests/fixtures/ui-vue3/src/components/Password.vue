<template>
  <div class="my-input input-container">
    <label v-if="label"> {{ label }}<span v-if="isRequired" class="required-mark">*</span> </label>
    <input
      v-model="modelValue"
      type="password"
      :class="{ valid: field.$valid, error: field.$error, pending: field.$pending }"
      :placeholder
    />
    <div
      v-if="modelValue"
      class="password-strength"
      :class="[`level-${field.$rules.strongPassword.$metadata.result?.id}`]"
    ></div>
    <ul v-if="field.$errors.length" class="errors">
      <li v-for="error of field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
    <div v-else-if="field.$valid" class="success">Your password is strong enough</div>
  </div>
</template>

<script setup lang="ts">
import {
  type InferRegleShortcuts,
  type Maybe,
  type RegleEnforceCustomRequiredRules,
  type RegleFieldStatus,
} from '@regle/core';
import { computed } from 'vue';
import type { useCustomRegle } from './regle.global.config';

const modelValue = defineModel<Maybe<string>>();

const props = defineProps<{
  field: RegleFieldStatus<
    string,
    RegleEnforceCustomRequiredRules<typeof useCustomRegle, 'strongPassword'>,
    InferRegleShortcuts<typeof useCustomRegle>
  >;
  label?: string;
  placeholder: string;
}>();

const isRequired = computed(() => {
  return props.field.$rules.required?.$active ?? false;
});
</script>
