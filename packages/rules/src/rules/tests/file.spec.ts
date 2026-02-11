import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { file } from '../file';

describe('file exec', () => {
  it('should not validate undefined values', () => {
    expect(file.exec(null)).toBe(true);
    expect(file.exec(undefined)).toBe(true);
  });

  it('should validate File value', () => {
    expect(file.exec(new File([], 'test.txt'))).toBe(true);
  });

  it('should not validate other values', () => {
    expect(file.exec(0)).toBe(false);
    expect(file.exec(1)).toBe(false);
    expect(file.exec(true)).toBe(false);
    expect(file.exec(false)).toBe(false);
  });
});

describe('file on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ value: undefined as any }, { value: { file } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.value.$value = 0;
    await nextTick();
    expect(vm.r$.value.$error).toBe(true);
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a native File']);

    vm.r$.value.$value = new File([], 'test.txt');
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
    expect(vm.r$.value.$errors).toStrictEqual(['The value must be a native File']);

    vm.r$.value.$value = null as any;
    await nextTick();
    expect(vm.r$.value.$error).toBe(false);
    expect(vm.r$.value.$errors).toStrictEqual([]);
  });
});

describe('file on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          file: withMessage(file, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
