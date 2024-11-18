import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

const integerRegex = /(^[0-9]*$)|(^-[0-9]+$)/;

export const integer: RegleRuleDefinition<string | number, [], false, boolean, string | number> =
  createRule({
    type: 'integer',
    validator(value: Maybe<number | string>) {
      if (ruleHelpers.isEmpty(value)) {
        return true;
      }
      return ruleHelpers.regex(value, integerRegex);
    },
    message: 'Value must be an integer',
  });
