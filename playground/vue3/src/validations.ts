import { createRule, defineRegleConfig, defineType } from '@regle/core';
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

export const useRegle = defineRegleConfig({
  options: {},
  rules: () => ({
    maxLength: withMessage(maxLength, (value, { $params: [count] }) => {
      return `ehooo ${count} is max`;
    }),
    asyncEmail,
  }),
});
