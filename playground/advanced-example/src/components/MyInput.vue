<template>
  <div class="block">
    <label class="text-gray-700" v-if="label">
      {{ label }}<span v-if="field?.$isRequired" class="text-red-400">*</span>
    </label>
    <input
      v-model="modelValue"
      :type
      :class="{
        'border-green-500': field?.$correct,
        'border-red-400': field?.$error,
        'border-orange-300': field?.$pending,
      }"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      :placeholder
    />
    <span v-if="field?.$pending" class="text-orange-300 text-xs"> Checking... </span>
    <ul v-if="field?.$tooltips.length" class="text-sm mt-1 text-gray-500">
      <li v-for="tooltip of field.$tooltips" :key="tooltip">
        {{ tooltip }}
      </li>
    </ul>
    <FieldError :errors="field?.$errors" />
  </div>
</template>

<script setup lang="ts">
import type { InferRegleShortcuts, Maybe, RegleFieldStatus } from '@regle/core';
import { type InputTypeHTMLAttribute } from 'vue';
import FieldError from './FieldError.vue';
import type { useCustomRegle } from '../validations/regle.global.config';

const modelValue = defineModel<Maybe<string | number>>({ required: true });

type MyShortcuts = InferRegleShortcuts<typeof useCustomRegle>;

const { type = 'text', ...props } = defineProps<{
  field?:
    | RegleFieldStatus<string | undefined, any, MyShortcuts>
    | RegleFieldStatus<number | undefined, any, MyShortcuts>;
  label?: string;
  type?: InputTypeHTMLAttribute;
  placeholder?: string;
}>();
</script>
