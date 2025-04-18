import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty } from '../helpers';

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

/**
 * Validates IPv4 addresses in dotted decimal notation 127.0.0.1.
 */
export const ipv4Address: RegleRuleDefinition<string, [], false, boolean, string> = createRule({
  type: 'ipv4Address',
  validator(value: Maybe<string>) {
    if (isEmpty(value)) {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    const nibbles = value.split('.');
    return nibbles.length === 4 && nibbles.every(nibbleValid);
  },
  message: 'The value is not a valid IPv4 address',
});
