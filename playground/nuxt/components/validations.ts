import type { Maybe } from '@regle/core';
import { createRule, defineRegleConfig } from '@regle/core';
import { ruleHelpers, withMessage, maxLength } from '@regle/rules';

export function timeout(count: number) {
  return new Promise((resolve) => setTimeout(resolve, count));
}

export const asyncEmail = createRule({
  type: 'asyncEmail',
  async validator(value: Maybe<string>, limit: number) {
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

export const { useRegle, inferRules } = defineRegleConfig({
  rules: () => ({
    maxLength: withMessage(maxLength, (value, { $params: [count] }) => {
      return `ehooo ${count} is max`;
    }),
    asyncEmail: withMessage(asyncEmail, () => ''),
  }),
  modifiers: {
    autoDirty: false,
    lazy: true,
    rewardEarly: true,
  },
});
