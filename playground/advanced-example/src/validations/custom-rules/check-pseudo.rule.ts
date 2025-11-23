import type { Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '@regle/rules';
import { createTimeout } from '../../utils/timeout';

const timeout = createTimeout();

export const checkPseudo = createRule({
  async validator(value: Maybe<string>) {
    if (isFilled(value)) {
      // Check the timeout function to see how cancellation can be handled
      await timeout(2000);
      return value !== 'regle';
    }
    return true;
  },
  message: 'The pseudo is already taken',
  tooltip({ $error, $pending }) {
    if ($error && !$pending) {
      return `Your pseudo can't be "regle"`;
    }
    return '';
  },
});
