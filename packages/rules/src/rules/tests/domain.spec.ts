import { defineRegleConfig, useRegle } from '@regle/core';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { domain } from '../domain';
import { createRegleComponent } from './utils';

describe('domain exec', () => {
  it('should validate undefined', () => {
    expect(domain.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(domain.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(domain.exec('')).toBe(true);
  });

  it('should validate simple domain', () => {
    expect(domain.exec('example.com')).toBe(true);
  });

  it('should validate subdomain', () => {
    expect(domain.exec('sub.domain.example.com')).toBe(true);
  });

  it('should validate domain with hyphen', () => {
    expect(domain.exec('my-domain.com')).toBe(true);
  });

  it('should not validate localhost', () => {
    expect(domain.exec('localhost')).toBe(false);
  });

  it('should not validate domain starting with hyphen', () => {
    expect(domain.exec('-invalid.com')).toBe(false);
  });

  it('should not validate domain ending with hyphen', () => {
    expect(domain.exec('invalid-.com')).toBe(false);
  });

  it('should not validate double dots', () => {
    expect(domain.exec('invalid..com')).toBe(false);
  });

  it('should not validate URL with protocol', () => {
    expect(domain.exec('http://example.com')).toBe(false);
  });

  it('should not validate domain with trailing dot', () => {
    expect(domain.exec('example.com.')).toBe(false);
  });

  it('should not validate domain with numeric tld', () => {
    expect(domain.exec('example.123')).toBe(false);
  });

  it('should not validate emails addresses', () => {
    expect(domain.exec('foo@example.com')).toBe(false);
  });

  it('should not validate domain with special characters', () => {
    expect(domain.exec('example.com/')).toBe(false);
  });
});

describe('domain on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { domain } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'localhost';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value is not a valid domain']);

    vm.r$.name.$value = 'example.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'localhost';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value is not a valid domain']);

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

describe('domain on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          domain: withMessage(domain, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
