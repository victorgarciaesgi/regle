<template>
  <div class="h-screen bg-white dark:bg-[#191a19] text-gray-900 dark:text-gray-200 p-6">
    <form @submit.prevent="submit" class="max-w-2xl mx-auto">
      <div class="flex flex-col gap-4">
        <!-- First Name -->
        <div class="flex flex-col gap-2">
          <label required>First Name</label>
          <input
            v-model="form.firstName"
            type="text"
            class="border border-gray-300 dark:border-gray-700 dark:bg-neutral-600 dark:text-gray-200 rounded p-2"
          />
          <FieldError :errors="r$.$errors.firstName" />
        </div>

        <!-- Last Name -->
        <div class="flex flex-col gap-2">
          <label required>Last Name</label>
          <input
            v-model="form.lastName"
            type="text"
            class="border border-gray-300 dark:border-gray-700 dark:bg-neutral-600 dark:text-gray-200 rounded p-2"
          />
          <FieldError :errors="r$.$errors.lastName" />
        </div>
      </div>

      <div class="flex items-center gap-4 mt-4">
        <button
          type="submit"
          class="bg-green-800 text-white rounded py-2 px-5 hover:bg-green-900 transition hover:active:bg-green-950"
        >
          Submit
        </button>

        <!-- Secondary button to toggle condition -->
        <button
          @click="condition = !condition"
          class="bg-gray-500 text-white rounded py-2 px-5 hover:bg-gray-900 transition hover:active:bg-gray-950 dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:active:bg-gray-900"
        >
          Toggle Condition
        </button>
        <span @click="condition = !condition">{{ condition }}</span>
      </div>

      <div v-if="isFormValid" class="mt-4 text-green-600"> Form is valid! </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { required, ruleHelpers } from '@regle/rules';
import FieldError from './FieldError.vue';
import { useRegle, createRule, type Maybe, type RegleComputedRules } from '@regle/core';

const condition = ref(true);
const isFormValid = ref(false);

const form = ref({
  firstName: '',
  lastName: '',
});

/**
 * It is recommended to create custom rules using the `createRule` function
 * instead of an inline function. It automatically tracks reactive
 * dependencies and allows you to add custom `active` behavior
 * to the rule.
 */
const customRule = createRule({
  validator(value: Maybe<string>, minLength: number, condition: boolean) {
    if (condition) {
      if (ruleHelpers.isFilled(value)) {
        return value.length >= minLength;
      }
      return true;
    }
    return true;
  },
  message: ({ $params: [minLength] }) => {
    return `The field must be filled and have more than ${minLength} characters, condition must be true.`;
  },
});

const rules = computed(() => {
  return {
    firstName: {
      required,
      customRule: customRule(15, condition),
    },
    lastName: {
      required,
    },
  } satisfies RegleComputedRules<typeof form>;
});

const { r$ } = useRegle(form, rules, { autoDirty: false });

const submit = async () => {
  isFormValid.value = false;

  const { result } = await r$.$validate();

  if (result) {
    isFormValid.value = true;
  }
};
</script>
