import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { boolean } from '../boolean';

describe('boolean exec', () => {
  it('should not validate undefined values', () => {
    expect(boolean.exec(null)).toBe(true);
    expect(boolean.exec(undefined)).toBe(true);
  });

  it('should validate true value', () => {
    expect(boolean.exec(true)).toBe(true);
  });

  it('should not validate false value', () => {
    expect(boolean.exec(false)).toBe(true);
  });

  it('should not validate other values', () => {
    expect(boolean.exec(0)).toBe(false);
    expect(boolean.exec(1)).toBe(false);
    expect(boolean.exec(new Date())).toBe(false);
  });
});

describe('boolean on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ value: undefined as any }, { value: { boolean } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.value.$value = 0;
    await nextTick();
    expect(vm.r$.value.$error).toBe(true);
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a native boolean']);

    vm.r$.value.$value = true;
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
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a native boolean']);

    vm.r$.value.$value = null as any;
    await nextTick();
    expect(vm.r$.value.$error).toBe(false);
    expect(vm.r$.value.$errors).toStrictEqual([]);
  });
});

describe('boolean on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          boolean: withMessage(boolean, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
