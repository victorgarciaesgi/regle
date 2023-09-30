import { MaybeRef } from 'vue';
import { createRule } from '../core';

export const requiredIf = createRule<any, [count: boolean, foo?: string]>({
  validator(value, condition, foo) {
    if (value != null) {
      return !condition;
    }
    return true;
  },
  message: 'Value is required',
  active(_, condition) {
    return condition;
  },
  type: 'required',
});
