import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty } from '../helpers';

/**
 * Validates MAC addresses. Call as a function to specify a custom separator (e.g., ':' or an empty string for 00ff1122334455).
 *
 * @param separator - the custom separator
 */
export const macAddress: RegleRuleWithParamsDefinition<
  string,
  [separator?: string | undefined],
  false,
  boolean,
  MaybeInput<string>
> = createRule({
  type: 'macAddress',
  validator(value: MaybeInput<string>, separator = ':') {
    if (isEmpty(value)) {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    const parts =
      typeof separator === 'string' && separator !== ''
        ? value.split(separator)
        : value.length === 12 || value.length === 16
          ? value.match(/.{2}/g)
          : null;

    return parts !== null && (parts.length === 6 || parts.length === 8) && parts.every(hexValid);
  },
  message: 'The value is not a valid MAC Address',
});

const hexValid = (hex: string) => hex.toLowerCase().match(/^[0-9a-f]{2}$/);
