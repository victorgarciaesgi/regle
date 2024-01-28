import { RegleRuleWithParamsDefinition, createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const requiredUnless: RegleRuleWithParamsDefinition<
  unknown,
  [condition: boolean],
  false,
  boolean
> = createRule({
  type: defineType<unknown, [condition: boolean]>('required'),
  validator(value, condition) {
    if (!condition) {
      return ruleHelpers.isFilled(typeof value === 'string' ? value.trim() : value);
    }
    return true;
  },
  message: 'Value is required',
  active(_, { $params: [condition] }) {
    return !condition;
  },
});
