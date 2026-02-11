import { defineRegleConfig, useRegle } from '@regle/core';
import { hexadecimal } from '../hexadecimal';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('hexadecimal exec', () => {
  it('should validate undefined', () => {
    expect(hexadecimal.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(hexadecimal.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(hexadecimal.exec('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(hexadecimal.exec('01234')).toBe(true);
  });

  it('should not validate space', () => {
    expect(hexadecimal.exec(' ')).toBe(false);
  });

  it('should not validate english letters', () => {
    expect(hexadecimal.exec('abcdefghijklmnopqrstuvwxyz')).toBe(false);
  });

  it('should not validate english letters uppercase', () => {
    expect(hexadecimal.exec('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(false);
  });

  it('should not validate padded numbers', () => {
    expect(hexadecimal.exec(' 123 ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(hexadecimal.exec('🎉')).toBe(false);
  });

  it('should not validate negative numbers', () => {
    expect(hexadecimal.exec('-123')).toBe(false);
  });

  it('should validate hexadecimal values', () => {
    expect(hexadecimal.exec('ABCDEF')).toBe(true);
    expect(hexadecimal.exec('c0ffee03')).toBe(true);
  });
});

describe('hexadecimal on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { hexadecimal } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'xyz';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be hexadecimal']);

    vm.r$.name.$value = 'c0ffee';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'xyz';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be hexadecimal']);

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

describe('hexadecimal on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          hexadecimal: withMessage(hexadecimal, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
