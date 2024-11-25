import type { RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const sameAs: RegleRuleWithParamsDefinition<
  unknown,
  [target: unknown, otherName?: string],
  false,
  boolean
> = createRule({
  type: 'sameAs',
  validator(value: unknown, target: unknown, otherName = 'other') {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return value === target;
  },
  message(_, { $params: [target, otherName] }) {
    return `Value must be equal to the ${otherName} value`;
  },
});
