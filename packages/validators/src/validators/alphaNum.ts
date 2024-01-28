import { RegleRuleDefinition, createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

const alphaNumRegex = /^[a-zA-Z0-9]*$/;

export const alphaNum: RegleRuleDefinition<string | number, [], false, boolean, string | number> =
  createRule({
    type: defineType<string | number>('alpha'),
    validator(value) {
      if (ruleHelpers.isEmpty(value)) {
        return true;
      }
      return ruleHelpers.regex(value, alphaNumRegex);
    },
    message: 'The value must be alpha-numeric',
  });
