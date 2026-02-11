import { defineRegleConfig, useRegle } from '@regle/core';
import { maxLength } from '../maxLength';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('maxLength exec', () => {
  it('should validate empty string', () => {
    expect(maxLength(5).exec('')).toBe(true);
  });

  it('should validate empty string for arbitrary limits', () => {
    expect(maxLength(-1).exec('')).toBe(true);
  });

  it('should skip string param', () => {
    expect(maxLength('eee' as any).exec('eeeeee')).toBe(true);
  });

  it('should validate null', () => {
    expect(maxLength(5).exec(null)).toBe(true);
  });

  it('should not validate too long string', () => {
    expect(maxLength(5).exec('abcdefgh')).toBe(false);
  });

  it('should validate characters on length bound', () => {
    expect(maxLength(5).exec('abcde')).toBe(true);
  });

  it('should not validate characters on length bound without allowEqual', () => {
    expect(maxLength(5, { allowEqual: false }).exec('abcde')).toBe(false);
  });

  it('should not validate too much characters', () => {
    expect(maxLength(5).exec('abcdefghi')).toBe(false);
  });

  it('should validate chain of spaces', () => {
    expect(maxLength(5).exec('     ')).toBe(true);
  });

  it('should not validate negative values', () => {
    expect(maxLength(-2).exec([1, 2])).toBe(false);
  });

  it('should skip empty arrays', () => {
    expect(maxLength(5).exec([])).toBe(true);
  });

  it('should validate short arrays', () => {
    expect(maxLength(5).exec([1])).toBe(true);
  });

  it('should not validate too long arrays', () => {
    expect(maxLength(5).exec([1, 2, 3, 4, 5, 6])).toBe(false);
  });

  it('should validate arrays on length bound', () => {
    expect(maxLength(5).exec([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should validate empty objects', () => {
    expect(maxLength(-2).exec({})).toBe(true);
  });

  it('should validate short objects', () => {
    expect(maxLength(5).exec({ a: 1 })).toBe(true);
  });

  it('should not validate too long objects', () => {
    expect(maxLength(5).exec({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 })).toBe(false);
  });

  it('should validate objects on length bound', () => {
    expect(maxLength(5).exec({ a: 1, b: 2, c: 3, d: 4, e: 5 })).toBe(true);
  });
});

describe('maxLength on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { maxLength: maxLength(5) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'abcdefgh';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be at most 5 characters long']);

    vm.r$.name.$value = 'abc';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'abcdefgh';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be at most 5 characters long']);

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

describe('maxLength on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          maxLength: withMessage(maxLength, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
