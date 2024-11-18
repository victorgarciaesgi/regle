import type { RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown], false, boolean> =
  createRule({
    type: 'sameAs',
    validator(value: unknown, target: unknown) {
      if (ruleHelpers.isEmpty(value)) {
        return true;
      }
      return value === target;
    },
    message(_, { $params: [target] }) {
      return `Value must be equal to "${target}"`;
    },
  });
