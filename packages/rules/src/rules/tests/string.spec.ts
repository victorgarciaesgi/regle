import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { string } from '../string';

describe('string exec', () => {
  it('should validate undefined values', () => {
    expect(string.exec(null)).toBe(true);
    expect(string.exec(undefined)).toBe(true);
  });

  it('should validate string value', () => {
    expect(string.exec('hello')).toBe(true);
  });

  it('should not validate other values', () => {
    expect(string.exec(0)).toBe(false);
    expect(string.exec(1)).toBe(false);
  });

  it('should not validate other values', () => {
    expect(string.exec(new Date())).toBe(false);
    expect(string.exec(new Error())).toBe(true);
    expect(string.exec(true)).toBe(false);
    expect(string.exec(false)).toBe(false);
  });
});

describe('string on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ value: undefined as any }, { value: { string } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.value.$value = 0;
    await nextTick();
    expect(vm.r$.value.$error).toBe(true);
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a string']);

    vm.r$.value.$value = 'hello';
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
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a string']);

    vm.r$.value.$value = null as any;
    await nextTick();
    expect(vm.r$.value.$error).toBe(false);
    expect(vm.r$.value.$errors).toStrictEqual([]);
  });
});

describe('string on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          string: withMessage(string, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
