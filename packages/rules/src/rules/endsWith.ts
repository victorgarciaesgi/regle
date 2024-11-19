import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const endsWith: RegleRuleWithParamsDefinition<
  string,
  [part: Maybe<string>],
  false,
  boolean
> = createRule({
  type: 'endsWith',
  validator(value: Maybe<string>, part: Maybe<string>) {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(part)) {
      return value.endsWith(part);
    }
    return true;
  },
  message(_, { $params: [part] }) {
    return `Field must end with ${part}`;
  },
});
