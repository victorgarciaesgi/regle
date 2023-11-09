import { createRule } from '@regle/core';

export const ruleMockSimple = createRule({
  validator(value) {
    return !!value;
  },
  message: 'Error',
});

export const ruleMockParams = createRule<string, [foo: string]>({
  validator(value, foo) {
    if (value) {
      return value === foo;
    }
    return true;
  },
  message(value, foo) {
    return `Error, received: ${foo}`;
  },
});
