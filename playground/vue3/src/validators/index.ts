import { defineCustomValidators, withParams } from '@shibie/core';
import type { Ref } from 'vue';

export function greaterThan(field: Ref<number | undefined>) {
  return withParams({ field }, (value: number | undefined) => {
    if (field.value && value) {
      return value > field.value;
    }
    return true;
  });
}

export function greaterThanOrEqual(field: Ref<number | undefined>) {
  return withParams({ field }, (value: number | undefined) => {
    if (field.value && value) {
      return value >= field.value;
    }
    return true;
  });
}

export const { useForm } = defineCustomValidators((params) => {
  return {
    greaterThan: [
      `projectfreelancer.expenses.tracker.validations.errors.greaterThan`,
      { 0: params.greaterThan?.$params.field },
    ],
    greaterThanOrEqual: [
      `projectfreelancer.expenses.tracker.validations.errors.greaterThanOrEqual`,
      { 0: params.greaterThanOrEqual?.$params.field },
    ],
  };
});
