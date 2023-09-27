import { createRule, defineCustomValidators } from '@shibie/core';

export const not = createRule({
  type: 'not',
  validator(value: string, target: string) {
    return value !== target;
  },
  message(value: string, target: string) {
    return `Value can't be ${target}`;
  },
});

export const { useForm } = defineCustomValidators(() => ({
  not,
}));
