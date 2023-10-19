import { RegleRuleWithParamsDefinition, createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const requireUnless: RegleRuleWithParamsDefinition<unknown, [condition: boolean]> =
  createRule<unknown, [condition: boolean]>({
    validator(value, condition) {
      if (!condition) {
        return ruleHelpers.isFilled(value);
      }
      return true;
    },
    message: 'Value is required',
    active(_, condition) {
      return !condition;
    },
    type: 'required',
  });
