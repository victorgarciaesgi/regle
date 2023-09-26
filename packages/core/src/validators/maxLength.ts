import { createRule } from '../core';

export const maxLength = createRule({
  validator: (value: string, count: number) => {
    if (value != null && count != null && !isNaN(count)) {
      return value.length <= count;
    }
    return true;
  },
  message: (value: string, count: number) => {
    return `Value must be maximum ${count} characters long`;
  },
});
