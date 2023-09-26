import { createRule } from '../core';

export const required = createRule({
  validator: (value: any) => !!value,
  message: 'Value is required',
  type: 'required',
});
