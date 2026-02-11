import { defineRegleConfig, useRegle } from '@regle/core';
import { integer } from '../integer';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('integer exec', () => {
  it('should validate undefined', () => {
    expect(integer.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(integer.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(integer.exec('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(integer.exec('01234')).toBe(true);
  });

  it('should not validate space', () => {
    expect(integer.exec(' ')).toBe(false);
  });

  it('should not validate english letters', () => {
    expect(integer.exec('abcdefghijklmnopqrstuvwxyz')).toBe(false);
  });

  it('should not validate english letters uppercase', () => {
    expect(integer.exec('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(false);
  });

  it('should not validate alphanum', () => {
    expect(integer.exec('abc123')).toBe(false);
  });

  it('should not validate padded letters', () => {
    expect(integer.exec(' 123 ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(integer.exec('🎉')).toBe(false);
  });

  it('should not validate minus sign', () => {
    expect(integer.exec('-')).toBe(false);
  });

  it('should validate negative numbers', () => {
    expect(integer.exec('-123')).toBe(true);
  });

  it('should not validate decimal numbers', () => {
    expect(integer.exec('0.1')).toBe(false);
    expect(integer.exec('1.0')).toBe(false);
  });

  it('should not validate negative decimal numbers', () => {
    expect(integer.exec('-123.4')).toBe(false);
  });
});

describe('integer on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { integer } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'abc';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be an integer']);

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
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be an integer']);

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

describe('integer on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          integer: withMessage(integer, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
