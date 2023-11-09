import { RegleRuleWithParamsDefinition, createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown]> = createRule<
  unknown,
  [target: unknown]
>({
  type: 'sameAs',
  validator(value, target) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return value === target;
  },
  message(_, target) {
    return `Value must be equal to "${target}"`;
  },
});
