import { defineRegleConfig, useRegle } from '@regle/core';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { containsUppercase } from '../containsUppercase';
import { createRegleComponent } from './utils';

describe('containsUppercase exec', () => {
  it('should validate undefined and empty values', () => {
    expect(containsUppercase.exec(undefined)).toBe(true);
    expect(containsUppercase.exec(null)).toBe(true);
    expect(containsUppercase.exec('')).toBe(true);
  });

  it('should validate one uppercase by default', () => {
    expect(containsUppercase.exec('hello')).toBe(false);
    expect(containsUppercase.exec('Hello')).toBe(true);
  });

  it('should validate custom count', () => {
    expect(containsUppercase(2).exec('Abc')).toBe(false);
    expect(containsUppercase(2).exec('ABc')).toBe(true);
  });

  it('should normalize invalid counts', () => {
    expect(containsUppercase(0).exec('Abc')).toBe(true);
    expect(containsUppercase(-4).exec('Abc')).toBe(true);
    expect(containsUppercase(2.8).exec('ABc')).toBe(true);
    expect(containsUppercase(2.8).exec('Abc')).toBe(false);
  });
});

describe('containsUppercase on useRegle', () => {
  it('should work with useRegle default and custom count', async () => {
    function formComponent() {
      return useRegle(
        { password: '', code: '' },
        {
          password: { containsUppercase },
          code: { containsUppercase: containsUppercase(2) },
        }
      );
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.password.$value = 'lowercase';
    vm.r$.code.$value = 'Abc';
    await nextTick();

    expect(vm.r$.password.$error).toBe(true);
    expect(vm.r$.password.$errors).toStrictEqual(['This field must contain at least 1 uppercase letter']);
    expect(vm.r$.code.$error).toBe(true);
    expect(vm.r$.code.$errors).toStrictEqual(['This field must contain at least 2 uppercase letters']);

    vm.r$.password.$value = 'Hello';
    vm.r$.code.$value = 'ABc';
    await nextTick();

    expect(vm.r$.password.$error).toBe(false);
    expect(vm.r$.password.$errors).toStrictEqual([]);
    expect(vm.r$.code.$error).toBe(false);
    expect(vm.r$.code.$errors).toStrictEqual([]);
  });
});

describe('containsUppercase on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          containsUppercase: withMessage(containsUppercase, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
