import { RegleRuleWithParamsDefinition, createRule } from '@regle/core';
import { isEmpty } from '../helpers';

export const requiredIf: RegleRuleWithParamsDefinition<unknown, [condition: boolean]> = createRule<
  unknown,
  [condition: boolean]
>({
  validator(value, condition) {
    if (condition) {
      return !isEmpty(value);
    }
    return true;
  },
  message: 'Value is required',
  active(_, condition) {
    return condition;
  },
  type: 'required',
});
