import { defineRegleConfig, useRegle } from '@regle/core';
import { email } from '../email';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('email exec', () => {
  it('should validate undefined', () => {
    expect(email.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(email.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(email.exec('')).toBe(true);
  });

  it('should not validate numbers', () => {
    expect(email.exec('12345')).toBe(false);
  });

  it('should not validate strings', () => {
    expect(email.exec('asdf12345')).toBe(false);
  });

  it('should not validate space', () => {
    expect(email.exec(' ')).toBe(false);
  });

  it('should not validate incomplete addresses', () => {
    expect(email.exec('someone@')).toBe(false);
    expect(email.exec('someone@gmail')).toBe(false);
    expect(email.exec('someone@gmail.')).toBe(false);
    expect(email.exec('someone@gmail.c')).toBe(false);
    expect(email.exec('gmail.com')).toBe(false);
    expect(email.exec('@gmail.com')).toBe(false);
  });

  it('should not validate addresses that contain unsupported characters', () => {
    expect(email.exec('someone@g~mail.com')).toBe(false);
    expect(email.exec('someone@g=ail.com')).toBe(false);
    expect(email.exec('"someone@gmail.com')).toBe(false);
    expect(email.exec('nonvalid±@gmail.com')).toBe(false);
    expect(email.exec('joão@gmail.com')).toBe(false);
    expect(email.exec('someõne@gmail.com')).toBe(false);
  });

  it('should not validate addresses that contain spaces', () => {
    expect(email.exec('someone@gmail.com ')).toBe(false);
    expect(email.exec('someone@gmail.com    ')).toBe(false);
    expect(email.exec(' someone@gmail.com')).toBe(false);
    expect(email.exec('some one@gmail.com')).toBe(false);
  });

  it('should validate real addresses', () => {
    expect(email.exec('someone@gmail.com')).toBe(true);
    expect(email.exec('someone@g-mail.com')).toBe(true);
    expect(email.exec('some!one@gmail.com')).toBe(true);
    expect(email.exec('soMe12_one@gmail.com')).toBe(true);
    expect(email.exec('someone@gmail.co')).toBe(true);
    expect(email.exec('someone@g.cn')).toBe(true);
    expect(email.exec('someone@g.accountants')).toBe(true);
    expect(email.exec('"some@one"@gmail.com')).toBe(true);
    expect(email.exec('"some one"@gmail.com')).toBe(true);
    expect(email.exec('user.name+tag+sorting@example.com')).toBe(true);
    expect(email.exec('"john..doe"@example.org')).toBe(true);
    expect(email.exec('someone@Example.com')).toBe(true);
  });
});

describe('email on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { email } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'notanemail';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be a valid email address']);

    vm.r$.name.$value = 'test@example.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'notanemail';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be a valid email address']);

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

describe('email on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          email: withMessage(email, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
