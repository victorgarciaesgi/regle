import { defineRegleConfig, useRegle } from '@regle/core';
import { nextTick } from 'vue';
import { applyIf, withMessage } from '../..';
import { minLength } from '../minLength';
import { createRegleComponent } from './utils';

describe('minLength exec', () => {
  it('should validate empty string', () => {
    expect(minLength(5).exec('')).toBe(true);
  });

  it('should validate null', () => {
    expect(minLength(5).exec(null)).toBe(true);
  });

  it('should not validate too short string', () => {
    expect(minLength(5).exec('a')).toBe(false);
  });

  it('should skip string param', () => {
    expect(minLength('eee' as any).exec('eeeeee')).toBe(true);
  });

  it('should validate enough characters', () => {
    expect(minLength(5).exec('abcde')).toBe(true);
  });

  it('should not validate enough characters without allowEqual', () => {
    expect(minLength(5, { allowEqual: false }).exec('abcde')).toBe(false);
  });

  it('should validate more than necessary characters', () => {
    expect(minLength(5).exec('abcdefghi')).toBe(true);
  });

  it('should validate enough spaces', () => {
    expect(minLength(5).exec('     ')).toBe(true);
  });

  it('should skip empty arrays', () => {
    expect(minLength(5).exec([])).toBe(false);
  });

  it('should not validate too short arrays', () => {
    expect(minLength(5).exec([1])).toBe(false);
  });

  it('should validate arrays with enough elements', () => {
    expect(minLength(5).exec([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should validate empty objects', () => {
    expect(minLength(5).exec({})).toBe(true);
  });

  it('should not validate too short objects', () => {
    expect(minLength(5).exec({ a: 1 })).toBe(false);
  });

  it('should validate objects with enough elements', () => {
    expect(minLength(5).exec({ a: 1, b: 2, c: 3, d: 4, e: 5 })).toBe(true);
  });
});

describe('minLength on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle(
        { name: '', foo: '' },
        { name: { minLength: minLength(5) }, foo: { minLength: applyIf(() => true, minLength(5)) } }
      );
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'ab';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be at least 5 characters long']);

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
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be at least 5 characters long']);

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

describe('minLength on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          minLength: withMessage(minLength, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
