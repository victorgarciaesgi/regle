import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { date } from '../date';

describe('date exec', () => {
  it('should not validate undefined values', () => {
    expect(date.exec(null)).toBe(true);
    expect(date.exec(undefined)).toBe(true);
  });

  it('should validate Date value', () => {
    expect(date.exec(new Date())).toBe(true);
  });

  it('should not validate other values', () => {
    expect(date.exec(0)).toBe(false);
    expect(date.exec(1)).toBe(false);
    expect(date.exec(true)).toBe(false);
    expect(date.exec(false)).toBe(false);
  });
});

describe('date on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ value: undefined as any }, { value: { date } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.value.$value = 0;
    await nextTick();
    expect(vm.r$.value.$error).toBe(true);
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a native Date']);

    vm.r$.value.$value = new Date();
    await nextTick();
    expect(vm.r$.value.$error).toBe(false);
    expect(vm.r$.value.$errors).toStrictEqual([]);

    vm.r$.value.$value = undefined;
    await nextTick();
    expect(vm.r$.value.$error).toBe(false);
    expect(vm.r$.value.$errors).toStrictEqual([]);

    vm.r$.value.$value = 0;
    await nextTick();
    expect(vm.r$.value.$error).toBe(true);
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a native Date']);

    vm.r$.value.$value = null as any;
    await nextTick();
    expect(vm.r$.value.$error).toBe(false);
    expect(vm.r$.value.$errors).toStrictEqual([]);
  });
});

describe('date on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          date: withMessage(date, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
