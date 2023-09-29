import { createRule, defineCustomValidators } from '@shibie/core';

export const not = createRule<any, [target: string]>({
  type: 'not',
  validator(value, target) {
    return value !== target;
  },
  message(value, target) {
    return `Value can't be ${target}`;
  },
});

export const { useForm } = defineCustomValidators(() => ({
  not,
}));
