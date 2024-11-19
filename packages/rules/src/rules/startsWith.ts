import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const startsWith: RegleRuleWithParamsDefinition<
  string,
  [part: Maybe<string>],
  false,
  boolean
> = createRule({
  type: 'startsWith',
  validator(value: Maybe<string>, part: Maybe<string>) {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(part)) {
      return value.startsWith(part);
    }
    return true;
  },
  message(_, { $params: [part] }) {
    return `Field must end with ${part}`;
  },
});
