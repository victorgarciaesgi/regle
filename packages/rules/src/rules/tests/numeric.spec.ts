import { defineRegleConfig, useRegle } from '@regle/core';
import { numeric } from '../numeric';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('numeric exec', () => {
  it('should validate undefined', () => {
    expect(numeric.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(numeric.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(numeric.exec('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(numeric.exec('01234')).toBe(true);
  });

  it('should not validate space', () => {
    expect(numeric.exec(' ')).toBe(false);
  });

  it('should not validate english letters', () => {
    expect(numeric.exec('abcdefghijklmnopqrstuvwxyz')).toBe(false);
  });

  it('should not validate english letters uppercase', () => {
    expect(numeric.exec('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(false);
  });

  it('should not validate alphanum', () => {
    expect(numeric.exec('abc123')).toBe(false);
  });

  it('should not validate padded letters', () => {
    expect(numeric.exec(' 123 ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(numeric.exec('🎉')).toBe(false);
  });

  it('should not validate negative numbers', () => {
    expect(numeric.exec('-123')).toBe(false);
  });

  it('should validate decimal numbers', () => {
    expect(numeric.exec('0.1')).toBe(true);
    expect(numeric.exec('1.0')).toBe(true);
  });

  it('should not validate negative decimal numbers', () => {
    expect(numeric.exec('-123.4')).toBe(false);
  });
});

describe('numeric on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { numeric } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'abc';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be numeric']);

    vm.r$.name.$value = '123';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'abc';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be numeric']);

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

describe('numeric on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          numeric: withMessage(numeric, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
