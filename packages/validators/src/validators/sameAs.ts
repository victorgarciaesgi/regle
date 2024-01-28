import { RegleRuleWithParamsDefinition, createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown], false, boolean> =
  createRule({
    type: defineType<unknown, [target: unknown]>('sameAs'),
    validator(value, target) {
      if (ruleHelpers.isEmpty(value)) {
        return true;
      }
      return value === target;
    },
    message(_, { $params: [target] }) {
      return `Value must be equal to "${target}"`;
    },
  });
