import { defineRegleConfig, useRegle } from '@regle/core';
import { uppercase } from '../uppercase';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('uppercase exec', () => {
  it('should validate undefined', () => {
    expect(uppercase.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(uppercase.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(uppercase.exec('')).toBe(true);
  });

  it('should validate uppercase string', () => {
    expect(uppercase.exec('HELLO')).toBe(true);
  });

  it('should validate uppercase with spaces', () => {
    expect(uppercase.exec('HELLO WORLD')).toBe(true);
  });

  it('should validate uppercase with numbers', () => {
    expect(uppercase.exec('TEST123')).toBe(true);
  });

  it('should validate uppercase with symbols', () => {
    expect(uppercase.exec('HELLO-WORLD_123')).toBe(true);
  });

  it('should not validate lowercase at start', () => {
    expect(uppercase.exec('Hello')).toBe(false);
  });

  it('should not validate all lowercase', () => {
    expect(uppercase.exec('hello')).toBe(false);
  });

  it('should not validate mixed case', () => {
    expect(uppercase.exec('HELLOworld')).toBe(false);
  });
});

describe('uppercase on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { uppercase } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be uppercase']);

    vm.r$.name.$value = 'HELLO';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be uppercase']);

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

describe('uppercase on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          uppercase: withMessage(uppercase, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
