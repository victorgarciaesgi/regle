import { createRule, defineCustomValidators, maxLength } from '@regle/core';
import { withMessage } from '@regle/core/src/helpers';

export const not = createRule<unknown, [target: string]>({
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
  maxLength: withMessage(maxLength, (value, count) => {
    return `ehooo ${count} is max`;
  }),
}));
