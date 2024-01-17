import { createRule, defineRegleOptions, defineType } from '@regle/core';
import { ruleHelpers, withMessage, maxLength } from '@regle/validators';

export function timeout(count: number) {
  return new Promise((resolve) => setTimeout(resolve, count));
}

export const asyncEmail = createRule({
  type: defineType<string, [limit: number]>('asyncEmail'),
  async validator(value, limit) {
    if (ruleHelpers.isEmpty(value)) {
      return { $valid: true };
    }
    await timeout(1000);
    return {
      $valid: limit === 2,
      foo: 'bar',
    };
  },
  message: 'Value is not an email',
});

export const useRegle = defineRegleOptions({
  options: {},
  rules: () => ({
    maxLength: withMessage(maxLength, (value) => {
      return `ehooo ${count} is max`;
    }),
    asyncEmail,
  }),
});
