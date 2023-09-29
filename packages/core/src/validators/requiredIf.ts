import { MaybeRef, unref } from 'vue';
import { createRule } from '../core';

export const requiredIf = createRule<any, [condition: MaybeRef<boolean> | (() => boolean)]>({
  validator(value, condition) {
    if (value != null) {
      return !unref(condition);
    }
    return true;
  },
  message: 'Value is required',
  active(_, condition) {
    return !unref(condition);
  },
  type: 'required',
});
