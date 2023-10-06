import { createRule } from '@regle/core';

export const required = createRule<unknown>({
  validator: (value) => !!value,
  message: 'Value is required',
  type: 'required',
});
