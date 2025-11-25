<template>
  <div class="block">
    <label class="text-gray-700" v-if="label">
      {{ label }}<span v-if="field.$isRequired" class="text-red-400">*</span>
    </label>
    <input
      v-model="modelValue"
      type="password"
      :class="{ 'border-green-500': field.$correct, 'border-red-400': field.$error }"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      :placeholder
    />
    <div
      v-if="modelValue"
      class="password-strength"
      :class="[`level-${field.$rules.strongPassword.$metadata.result?.id}`]"
    ></div>
    <ul v-if="field.$tooltips.length" class="text-sm mt-1 text-gray-500">
      <li v-for="tooltip of field.$tooltips" :key="tooltip">
        {{ tooltip }}
      </li>
    </ul>
    <div v-else-if="field.$correct" class="text-sm mt-1 text-green-600">Your password is strong enough</div>
  </div>
</template>

<script setup lang="ts">
import {
  type InferRegleShortcuts,
  type Maybe,
  type RegleEnforceCustomRequiredRules,
  type RegleFieldStatus,
} from '@regle/core';
import type { useCustomRegle } from '../validations/regle.global.config';

const modelValue = defineModel<Maybe<string>>();

const props = defineProps<{
  field: RegleFieldStatus<
    string | undefined,
    RegleEnforceCustomRequiredRules<typeof useCustomRegle, 'strongPassword'>,
    InferRegleShortcuts<typeof useCustomRegle>
  >;
  label?: string;
  placeholder: string;
}>();
</script>

<style lang="scss" scoped>
.password-strength {
  margin: 8px 8px 0 8px;
  width: calc(100% - 15px);
  height: 4px;
  border-radius: 4px;
  border: 1px solid rgb(230, 230, 230);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 100%;
    @apply bg-red-400;
    transition: width 0.2s ease;
  }

  &.level-0 {
    &::before {
      width: 10%;
    }
  }
  &.level-1 {
    &::before {
      width: 40%;
      @apply bg-orange-300;
    }
  }
  &.level-2 {
    &::before {
      width: 75%;
      @apply bg-green-400;
    }
  }
  &.level-3 {
    &::before {
      width: 100%;
      @apply bg-green-400;
    }
  }
}
</style>
