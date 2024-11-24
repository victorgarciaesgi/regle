import { createTimeout } from '@/utils/timeout';
import type { Maybe } from '@regle/core';
import { createRule, defineRegleConfig } from '@regle/core';
import { required, ruleHelpers, withMessage } from '@regle/rules';

function randomBoolean(): boolean {
  return [1, 2][Math.floor(Math.random() * 2)] === 1 ? true : false;
}

const timeout = createTimeout();

export const checkPseudo = createRule({
  async validator(value: Maybe<string>) {
    if (ruleHelpers.isFilled(value)) {
      // Check the timeout function to see how cancellation can be handled
      await timeout(2000);
      return randomBoolean();
    }
    return true;
  },
  message: 'The pseudo is already taken',
});

export const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    checkPseudo,
  }),
});
