import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

const numericRegex = /^\d*(\.\d+)?$/;

export const numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number> =
  createRule({
    type: 'numeric',
    validator(value: Maybe<string | number>) {
      if (ruleHelpers.isEmpty(value)) {
        return true;
      }
      return ruleHelpers.regex(value, numericRegex);
    },
    message: 'This field must be numeric',
  });
