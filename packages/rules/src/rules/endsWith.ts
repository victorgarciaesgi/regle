import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

export const endsWith: RegleRuleWithParamsDefinition<string, [part: Maybe<string>], false, boolean> = createRule({
  type: 'endsWith',
  validator(value: Maybe<string>, part: Maybe<string>) {
    if (isFilled(value) && isFilled(part)) {
      return value.endsWith(part);
    }
    return true;
  },
  message({ $params: [part] }) {
    return `Field must end with ${part}`;
  },
});
