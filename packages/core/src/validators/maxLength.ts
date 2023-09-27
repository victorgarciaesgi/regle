import { createRule } from '../core';

export const maxLength = createRule<string, [count: number]>({
  validator: (value, count) => {
    if (value != null && count != null && !isNaN(count)) {
      return value.length <= count;
    }
    return true;
  },
  message: (value, count) => {
    return `Value must be maximum ${count} characters long`;
  },
  type: 'maxLength',
});
