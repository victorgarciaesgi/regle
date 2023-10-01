import { createRule } from '../core';
import { isEmpty } from '../helpers';

export const requiredIf = createRule<any, [count: boolean, foo?: string]>({
  validator(value, condition, foo) {
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
