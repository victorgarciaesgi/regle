import type { RegleRuleDefinition } from '@regle/core';
import { createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

function nibbleValid(nibble: string) {
  if (nibble.length > 3 || nibble.length === 0) {
    return false;
  }

  if (nibble[0] === '0' && nibble !== '0') {
    return false;
  }

  if (!nibble.match(/^\d+$/)) {
    return false;
  }

  const numeric = +nibble | 0;
  return numeric >= 0 && numeric <= 255;
}

export const ipAddress: RegleRuleDefinition<string, [], false, boolean, string> = createRule({
  type: defineType<string>('ipAddress'),
  validator(value) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    const nibbles = value.split('.');
    return nibbles.length === 4 && nibbles.every(nibbleValid);
  },
  message: 'The value is not a valid IP address',
});
