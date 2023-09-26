import { MaybeRef, unref } from 'vue';
import { createRule } from '../core';

export const requiredIf = createRule({
  validator(value: any, condition: MaybeRef<boolean>) {
    if (value != null) {
      return !!unref(condition);
    }
    return true;
  },
  message: 'Value is required',
  active(_, condition: MaybeRef<boolean>) {
    return !!unref(condition);
  },
  type: 'required',
});
