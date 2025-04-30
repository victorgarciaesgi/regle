import type { RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty } from '../helpers';

/**
 * Checks if the value matches the specified property or ref.
 */
export const sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown, otherName?: string], false, boolean> =
  createRule({
    type: 'sameAs',
    validator(value: unknown, target: unknown, otherName?: string) {
      if (isEmpty(value)) {
        return true;
      }
      return value === target;
    },
    message({ $params: [_, otherName = 'other'] }) {
      return `The value must be equal to the ${otherName} value`;
    },
  });
