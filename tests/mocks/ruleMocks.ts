import { createRule, defineType } from '@regle/core';

export const ruleMockSimple = createRule({
  type: defineType('ruleSimple'),
  validator(value) {
    return !!value;
  },
  message: 'Error',
});

export const ruleMockParams = createRule({
  type: defineType<string, [foo: string]>('ruleMockParams'),
  validator(value, foo) {
    if (value) {
      return value === foo;
    }
    return true;
  },
  message(value, { $params: [foo] }) {
    return `Error, received: ${foo}`;
  },
});
