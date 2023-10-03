import { createRule } from '../core';
import { isEmpty } from '../helpers';

export const requiredIf = createRule<unknown, [condition: boolean]>({
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
