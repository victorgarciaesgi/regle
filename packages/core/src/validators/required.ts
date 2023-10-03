import { createRule } from '../core';

export const required = createRule<unknown>({
  validator: (value) => !!value,
  message: 'Value is required',
  type: 'required',
});
