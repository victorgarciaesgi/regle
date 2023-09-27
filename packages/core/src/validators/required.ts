import { createRule } from '../core';

export const required = createRule<any>({
  validator: (value) => !!value,
  message: 'Value is required',
  type: 'required',
});
