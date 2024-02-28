import { createRule, defineType } from '@regle/core';
import { ruleHelpers } from '@regle/validators';
import { timeout } from '../utils';

export const ruleMockIsFoo = createRule({
  type: defineType<string>('ruleMockIsFoo'),
  validator(value) {
    if (ruleHelpers.isFilled(value)) {
      return value === 'foo';
    }
    return true;
  },
  message: 'Custom error',
});

export const ruleMockIsEven = createRule({
  type: defineType<number>('ruleMockIsEven'),
  validator(value) {
    if (ruleHelpers.isFilled(value)) {
      return value % 2 === 0;
    }
    return true;
  },
  message: 'Custom error',
});

export const ruleMockIsEvenAsync = createRule({
  type: defineType<number>('ruleMockIsEven'),
  async validator(value) {
    if (ruleHelpers.isFilled(value)) {
      await timeout(1000);
      return value % 2 === 0;
    }
    return true;
  },
  message: 'Custom error',
});

export const ruleMockIsFooAsync = createRule({
  type: defineType<string>('ruleMockAsyncIsFoo'),
  async validator(value) {
    if (ruleHelpers.isFilled(value)) {
      await timeout(1000);
      return value === 'foo';
    }
    return true;
  },
  message: 'Custom error',
});

export const ruleMockIsEqualParam = createRule({
  type: defineType<string, [foo: string]>('ruleMockIsEqualParam'),
  validator(value, foo) {
    if (ruleHelpers.isFilled(value)) {
      return value === foo;
    }
    return true;
  },
  message(value, { $params: [foo] }) {
    return `Error, received: ${foo}`;
  },
});

export const ruleMockAsyncIsEqualParam = createRule({
  type: defineType<string, [foo: string]>('ruleMockIsEqualParam'),
  async validator(value, foo) {
    if (ruleHelpers.isFilled(value)) {
      await timeout(1000);
      return value === foo;
    }
    return true;
  },
  message(value, { $params: [foo] }) {
    return `Error, received: ${foo}`;
  },
});

export const inlineRuleMockIsFoo = (value: any) => {
  if (ruleHelpers.isFilled(value)) {
    return value === 'foo';
  }
  return true;
};

export const inlineRuleAsyncMockIsFoo = async (value: any) => {
  if (ruleHelpers.isFilled(value)) {
    await timeout(1000);
    return value === 'foo';
  }
  return true;
};
