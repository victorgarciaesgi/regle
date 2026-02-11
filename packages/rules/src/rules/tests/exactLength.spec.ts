import { defineRegleConfig, useRegle } from '@regle/core';
import { exactLength } from '../exactLength';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('exactLength exec', () => {
  it('should validate empty string', () => {
    expect(exactLength(5).exec('')).toBe(true);
  });

  it('should validate empty string for arbitrary limits', () => {
    expect(exactLength(-1).exec('')).toBe(true);
  });

  it('should not validate string param', () => {
    expect(exactLength('eee' as any).exec('eeeeee')).toBe(false);
  });

  it('should validate null', () => {
    expect(exactLength(5).exec(null)).toBe(true);
  });

  it('should not validate too long string', () => {
    expect(exactLength(5).exec('abcdefgh')).toBe(false);
  });

  it('should validate characters on length bound', () => {
    expect(exactLength(5).exec('abcde')).toBe(true);
  });

  it('should not validate too much characters', () => {
    expect(exactLength(5).exec('abcdefghi')).toBe(false);
  });

  it('should validate chain of spaces', () => {
    expect(exactLength(5).exec('     ')).toBe(true);
  });

  it('should validate empty arrays', () => {
    expect(exactLength(0).exec([])).toBe(true);
  });

  it('should validate short arrays', () => {
    expect(exactLength(1).exec([1])).toBe(true);
  });

  it('should not validate incorrect length on empty array', () => {
    expect(exactLength(5).exec([])).toBe(false);
  });

  it('should not validate too long arrays', () => {
    expect(exactLength(5).exec([1, 2, 3, 4, 5, 6])).toBe(false);
  });

  it('should validate arrays on length bound', () => {
    expect(exactLength(5).exec([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should validate empty objects', () => {
    expect(exactLength(0).exec({})).toBe(true);
  });

  it('should validate short objects', () => {
    expect(exactLength(1).exec({ a: 1 })).toBe(true);
  });

  it('should not validate too long objects', () => {
    expect(exactLength(5).exec({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 })).toBe(false);
  });

  it('should validate objects on length bound', () => {
    expect(exactLength(5).exec({ a: 1, b: 2, c: 3, d: 4, e: 5 })).toBe(true);
  });
});

describe('exactLength on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { exactLength: exactLength(5) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'ab';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be exactly 5 characters long']);

    vm.r$.name.$value = 'abcde';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'ab';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be exactly 5 characters long']);

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

describe('exactLength on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          exactLength: withMessage(exactLength, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
