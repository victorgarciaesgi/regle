import { defineRegleConfig, useRegle } from '@regle/core';
import { alphaNum } from '../alphaNum';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('alphaNum exec', () => {
  it('should validate undefined', () => {
    expect(alphaNum.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(alphaNum.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(alphaNum.exec('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(alphaNum.exec(1234567890)).toBe(true);
  });

  it('should not validate space', () => {
    expect(alphaNum.exec(' ')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alphaNum.exec('abcxyzABCXYZ')).toBe(true);
  });

  it('should validate english letters', () => {
    expect(alphaNum.exec('abcxyz_ABCXYZ')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alphaNum({ allowSymbols: true }).exec('abcxyz_ABCXYZ')).toBe(true);
  });

  it('should validate alphaNum', () => {
    expect(alphaNum.exec('abc123')).toBe(true);
  });

  it('should not validate padded letters', () => {
    expect(alphaNum.exec(' abc ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(alphaNum.exec('🎉')).toBe(false);
  });
});

describe('alphaNum on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { alphaNum } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = '!@#';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be alpha-numeric']);

    vm.r$.name.$value = 'abc123';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = '!@#';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be alpha-numeric']);

    vm.r$.name.$value = '';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = null as any;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);
  });
});

describe('alphaNum on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          alphaNum: withMessage(alphaNum, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
