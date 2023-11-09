import { RegleRuleWithParamsDefinition, createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const requiredUnless: RegleRuleWithParamsDefinition<unknown, [condition: boolean]> =
  createRule<unknown, [condition: boolean]>({
    validator(value, condition) {
      console.log(condition);
      if (!condition) {
        return ruleHelpers.isFilled(typeof value === 'string' ? value.trim() : value);
      }
      return true;
    },
    message: 'Value is required',
    active(_, condition) {
      return !condition;
    },
    type: 'required',
  });
