import { defineRegleConfig, useRegle } from '@regle/core';
import { lowercase } from '../lowercase';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('lowercase exec', () => {
  it('should validate undefined', () => {
    expect(lowercase.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(lowercase.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(lowercase.exec('')).toBe(true);
  });

  it('should validate lowercase string', () => {
    expect(lowercase.exec('hello')).toBe(true);
  });

  it('should validate lowercase with spaces', () => {
    expect(lowercase.exec('hello world')).toBe(true);
  });

  it('should validate lowercase with numbers', () => {
    expect(lowercase.exec('test123')).toBe(true);
  });

  it('should validate lowercase with symbols', () => {
    expect(lowercase.exec('hello-world_123')).toBe(true);
  });

  it('should not validate uppercase at start', () => {
    expect(lowercase.exec('Hello')).toBe(false);
  });

  it('should not validate all uppercase', () => {
    expect(lowercase.exec('HELLO')).toBe(false);
  });

  it('should not validate camelCase', () => {
    expect(lowercase.exec('helloWorld')).toBe(false);
  });
});

describe('lowercase on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { lowercase } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'HELLO';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be lowercase']);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'HELLO';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be lowercase']);

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

describe('lowercase on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          lowercase: withMessage(lowercase, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
