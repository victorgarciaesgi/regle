import type { Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '@regle/rules';
import { timeout } from '../utils';

export const ruleMockIsFoo = createRule({
  validator(value: Maybe<string>) {
    if (ruleHelpers.isFilled(value)) {
      return value === 'foo';
    }
    return true;
  },
  message: 'Custom error',
});

export const ruleMockIsEven = createRule({
  validator(value: Maybe<number>) {
    if (ruleHelpers.isFilled(value)) {
      return value % 2 === 0;
    }
    return true;
  },
  message: 'Custom error',
});

export function ruleMockIsEvenAsync(time = 1000) {
  return createRule({
    async validator(value: Maybe<number>) {
      if (ruleHelpers.isFilled(value)) {
        await timeout(time);
        return value % 2 === 0;
      }
      return true;
    },
    message: 'Custom error',
  });
}

export function ruleMockIsFooAsync() {
  return createRule({
    async validator(value: Maybe<string>) {
      if (ruleHelpers.isFilled(value)) {
        await timeout(1000);
        return value === 'foo';
      }
      return true;
    },
    message: 'Custom error',
  });
}

export const ruleMockIsEqualParam = createRule({
  validator(value: Maybe<string>, foo: string) {
    if (ruleHelpers.isFilled(value)) {
      return value === foo;
    }
    return true;
  },
  message(value, { $params: [foo] }) {
    return `Error, received: ${foo}`;
  },
});

export const ruleMockIsEqualParamAsync = createRule({
  async validator(value: Maybe<string>, foo: string) {
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
