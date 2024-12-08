<template>
  <div class="my-input input-container">
    <label v-if="label">
      {{ label }}<span v-if="field.$isRequired" class="required-mark">*</span>
    </label>
    <input
      v-model="modelValue"
      :type
      :class="{ valid: field.$valid, error: field.$error, pending: field.$pending }"
      :placeholder
    />
    <span v-if="field.$pending" class="pending-text"> Checking... </span>
    <ul v-if="field.$errors.length" class="errors">
      <li v-for="error of field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { InferRegleShortcuts, Maybe, RegleFieldStatus } from '@regle/core';
import { type InputTypeHTMLAttribute } from 'vue';
import type { useCustomRegle } from './regle.global.config';

const modelValue = defineModel<Maybe<string | number>>();

type MyShortcuts = InferRegleShortcuts<typeof useCustomRegle>;

const { type = 'text', ...props } = defineProps<{
  field:
    | RegleFieldStatus<string | undefined, any, MyShortcuts>
    | RegleFieldStatus<number | undefined, any, MyShortcuts>;
  label?: string;
  type?: InputTypeHTMLAttribute;
  placeholder: string;
}>();
</script>
