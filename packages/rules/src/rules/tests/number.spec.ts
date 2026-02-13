import { defineRegleConfig, useRegle } from '@regle/core';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { number } from '../number';
import { createRegleComponent } from './utils';

describe('number exec', () => {
  it('should validate empty values', () => {
    expect(number.exec(undefined)).toBe(true);
    expect(number.exec(null)).toBe(true);
    expect(number.exec('')).toBe(true);
  });

  it('should validate native numbers', () => {
    expect(number.exec(0)).toBe(true);
    expect(number.exec(1)).toBe(true);
    expect(number.exec(Number.NaN)).toBe(false);
  });

  it('should not validate non-number values', () => {
    expect(number.exec('1')).toBe(false);
    expect(number.exec(true)).toBe(false);
    expect(number.exec(new Date())).toBe(false);
  });
});

describe('number on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ value: undefined as any }, { value: { number } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.value.$value = '0';
    await nextTick();
    expect(vm.r$.value.$error).toBe(true);
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a native number']);

    vm.r$.value.$value = 0;
    await nextTick();
    expect(vm.r$.value.$error).toBe(false);
    expect(vm.r$.value.$errors).toStrictEqual([]);

    vm.r$.value.$value = undefined;
    await nextTick();
    expect(vm.r$.value.$error).toBe(false);
    expect(vm.r$.value.$errors).toStrictEqual([]);
  });
});

describe('number on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          number: withMessage(number, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
