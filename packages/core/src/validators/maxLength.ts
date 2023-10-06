import { isEmpty } from '../helpers';
import { createRule } from '../core';

export const maxLength = createRule<string, [count: number]>({
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
