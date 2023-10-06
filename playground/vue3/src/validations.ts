import { createRule, defineCustomValidators, maxLength } from '@regle/core';
import { isEmpty, withMessage } from '@regle/core/src/helpers';

export const not = createRule<unknown, [target: string]>({
  type: 'not',
  validator(value, target) {
    return value !== target;
  },
  message(value, target) {
    return `Value can't be ${target}`;
  },
});

export function timeout(count: number) {
  return new Promise((resolve) => setTimeout(resolve, count));
}

export const asyncEmail = createRule<string, [limit: number]>({
  type: 'email',
  async validator(value, limit) {
    if (isEmpty(value)) {
      return true;
    }
    await timeout(1000);
    return limit === 2;
  },
  message: 'Value is not an email',
});

export const { useRegle } = defineCustomValidators(() => ({
  not,
  maxLength: withMessage(maxLength, (value, count) => {
    return `ehooo ${count} is max`;
  }),
  asyncEmail,
}));
