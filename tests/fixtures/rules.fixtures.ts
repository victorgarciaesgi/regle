import type { Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '@regle/rules';
import { timeout } from '../utils';

export const mockedValidations = {
  isFoo: vi.fn((value) => value === 'foo'),
  isEven: vi.fn((value) => value % 2 === 0),
};

export const ruleMockIsFoo = createRule({
  validator(value: Maybe<string>) {
    if (isFilled(value)) {
      return mockedValidations.isFoo(value);
    }
    return true;
  },
  message: 'Custom error',
});

export const ruleMockIsEven = createRule({
  validator(value: Maybe<number>) {
    if (isFilled(value)) {
      return mockedValidations.isEven(value);
    }
    return true;
  },
  message: 'Custom error',
});

export const ruleMockMetadata = createRule({
  validator(value: Maybe<number>) {
    if (isFilled(value)) {
      return mockedValidations.isEven(value);
    }
    return { $valid: true, customData: 'hello' };
  },
  message: 'Custom error',
});

export function ruleMockIsEvenAsync(time = 1000) {
  return createRule({
    async validator(value: Maybe<number>) {
      if (isFilled(value)) {
        await timeout(time);
        return mockedValidations.isEven(value);
      }
      return true;
    },
    message: 'Custom error',
  });
}

export function ruleMockIsFooAsync(time = 1000) {
  return createRule({
    async validator(value: Maybe<string>) {
      if (isFilled(value)) {
        await timeout(time);
        return mockedValidations.isFoo(value);
      }
      return true;
    },
    message: 'Custom error',
  });
}

export const ruleMockIsEqualParam = createRule({
  validator(value: Maybe<string>, foo: string) {
    if (isFilled(value)) {
      return value === foo;
    }
    return true;
  },
  message({ $params: [foo] }) {
    return `Error, received: ${foo}`;
  },
});

export const ruleMockIsEqualParamAsync = createRule({
  async validator(value: Maybe<string>, foo: string) {
    if (isFilled(value)) {
      await timeout(1000);
      return value === foo;
    }
    return true;
  },
  message({ $params: [foo] }) {
    return `Error, received: ${foo}`;
  },
});

export const inlineRuleMockIsFoo = (value: any) => {
  if (isFilled(value)) {
    return mockedValidations.isFoo(value);
  }
  return true;
};

export const inlineRuleAsyncMockIsFoo = async (value: any) => {
  if (isFilled(value)) {
    await timeout(1000);
    return mockedValidations.isFoo(value);
  }
  return true;
};
