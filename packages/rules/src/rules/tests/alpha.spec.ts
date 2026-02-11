import { defineRegleConfig, useRegle } from '@regle/core';
import { alpha } from '../alpha';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('alpha exec', () => {
  it('should validate undefined', () => {
    expect(alpha.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(alpha.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(alpha.exec('')).toBe(true);
  });

  it('should not validate numbers', () => {
    expect(alpha.exec('1234')).toBe(false);
  });

  it('should not validate space', () => {
    expect(alpha.exec(' ')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alpha.exec('abcdefghijklmnopqrstuvwxyz')).toBe(true);
  });

  it('should validate english letters', () => {
    expect(alpha.exec('abcdefgh_ijklmnopqr_stuvwxyz')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alpha({ allowSymbols: true }).exec('abcdefgh_ijklmnopqr_stuvwxyz')).toBe(true);
  });

  it('should validate english letters uppercase', () => {
    expect(alpha.exec('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true);
  });

  it('should not validate alphanum', () => {
    expect(alpha.exec('abc123')).toBe(false);
  });

  it('should not validate padded letters', () => {
    expect(alpha.exec(' abc ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(alpha.exec('🎉')).toBe(false);
  });
});

describe('alpha on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { alpha } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = '123';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be alphabetical']);

    vm.r$.name.$value = 'abc';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = '123';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be alphabetical']);

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

describe('alpha on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          alpha: withMessage(alpha, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
