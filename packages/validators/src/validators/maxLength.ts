import { isEmpty } from '../helpers';
import { createRule, RegleRuleWithParamsDefinition } from '@regle/core';

export const maxLength: RegleRuleWithParamsDefinition<string, [count: number]> = createRule<
  string,
  [count: number]
>({
  validator: (value, count) => {
    if (!isEmpty(value) && !isEmpty(count)) {
      return value.length <= count;
    }
    return true;
  },
  message: (value, count) => {
    return `Value must be maximum ${count} characters long`;
  },
  type: 'maxLength',
});
