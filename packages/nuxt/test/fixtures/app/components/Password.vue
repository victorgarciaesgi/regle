<template>
  <div class="my-input input-container">
    <label v-if="label"> {{ label }}<span v-if="isRequired" class="required-mark">*</span> </label>
    <input
      v-model="modelValue"
      type="password"
      :class="{ valid: field.$correct, error: field.$error, pending: field.$pending }"
      :placeholder
    />
    <div
      v-if="modelValue"
      class="password-strength"
      :class="[`level-${field.$rules.strongPassword.$metadata.result?.id}`]"
    ></div>
    <ul v-if="field.$tooltips.length" class="tooltips">
      <li v-for="tooltip of field.$tooltips" :key="tooltip">
        {{ tooltip }}
      </li>
    </ul>
    <div v-else-if="field.$correct" class="success">Your password is strong enough</div>
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
import type { regleConfig } from '../regle-config';

const modelValue = defineModel<Maybe<string>>();

const props = defineProps<{
  field: RegleFieldStatus<
    string | undefined,
    RegleEnforceCustomRequiredRules<typeof regleConfig.useRegle, 'strongPassword'>,
    InferRegleShortcuts<typeof regleConfig.useRegle>
  >;
  label?: string;
  placeholder: string;
}>();

const isRequired = computed(() => {
  return props.field.$isRequired;
});
</script>
