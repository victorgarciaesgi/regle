import { RegleRuleWithParamsDefinition, createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const requiredIf: RegleRuleWithParamsDefinition<unknown, [condition: boolean]> = createRule<
  unknown,
  [condition: boolean]
>({
  validator(value, condition) {
    if (condition) {
      return ruleHelpers.isFilled(typeof value === 'string' ? value.trim() : value);
    }
    return true;
  },
  message: 'Value is required',
  active(_, { $params: [condition] }) {
    return condition;
  },
  type: 'required',
});
