import { createRule, defineRegleOptions } from '@regle/core';
import { ruleHelpers, withMessage, maxLength } from '@regle/validators';

export function timeout(count: number) {
  return new Promise((resolve) => setTimeout(resolve, count));
}

export const asyncEmail = createRule<
  string,
  [limit: number],
  true,
  { $valid: boolean; foo?: string }
>({
  type: 'email',
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
    maxLength: withMessage(maxLength, (value, count) => {
      return `ehooo ${count} is max`;
    }),
    asyncEmail,
  }),
});
