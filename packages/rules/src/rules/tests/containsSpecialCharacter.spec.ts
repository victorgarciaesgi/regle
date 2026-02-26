import { defineRegleConfig, useRegle } from '@regle/core';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { containsSpecialCharacter } from '../containsSpecialCharacter';
import { createRegleComponent } from './utils';

describe('containsSpecialCharacter exec', () => {
  it('should validate undefined and empty values', () => {
    expect(containsSpecialCharacter.exec(undefined)).toBe(true);
    expect(containsSpecialCharacter.exec(null)).toBe(true);
    expect(containsSpecialCharacter.exec('')).toBe(true);
  });

  it('should validate one special character by default', () => {
    expect(containsSpecialCharacter.exec('abc')).toBe(false);
    expect(containsSpecialCharacter.exec('ab#c')).toBe(true);
  });

  it('should validate custom count', () => {
    expect(containsSpecialCharacter(2).exec('ab#c')).toBe(false);
    expect(containsSpecialCharacter(2).exec('ab#c!')).toBe(true);
  });

  it('should normalize invalid counts', () => {
    expect(containsSpecialCharacter(0).exec('ab#c')).toBe(true);
    expect(containsSpecialCharacter(-4).exec('ab#c')).toBe(true);
    expect(containsSpecialCharacter(2.8).exec('ab#c!')).toBe(true);
    expect(containsSpecialCharacter(2.8).exec('ab#c')).toBe(false);
  });
});

describe('containsSpecialCharacter on useRegle', () => {
  it('should work with useRegle default and custom count', async () => {
    function formComponent() {
      return useRegle(
        { password: '', passcode: '' },
        {
          password: { containsSpecialCharacter },
          passcode: { containsSpecialCharacter: containsSpecialCharacter(2) },
        }
      );
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.password.$value = 'abcd';
    vm.r$.passcode.$value = 'ab#c';
    await nextTick();

    expect(vm.r$.password.$error).toBe(true);
    expect(vm.r$.password.$errors).toStrictEqual(['This field must contain at least 1 special character']);
    expect(vm.r$.passcode.$error).toBe(true);
    expect(vm.r$.passcode.$errors).toStrictEqual(['This field must contain at least 2 special characters']);

    vm.r$.password.$value = 'ab#c';
    vm.r$.passcode.$value = 'ab#c!';
    await nextTick();

    expect(vm.r$.password.$error).toBe(false);
    expect(vm.r$.password.$errors).toStrictEqual([]);
    expect(vm.r$.passcode.$error).toBe(false);
    expect(vm.r$.passcode.$errors).toStrictEqual([]);
  });
});

describe('containsSpecialCharacter on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          containsSpecialCharacter: withMessage(containsSpecialCharacter, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
