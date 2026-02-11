import { defineRegleConfig, useRegle } from '@regle/core';
import { hostname } from '../hostname';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('hostname exec', () => {
  it('should validate undefined', () => {
    expect(hostname.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(hostname.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(hostname.exec('')).toBe(true);
  });

  it('should validate localhost', () => {
    expect(hostname.exec('localhost')).toBe(true);
  });

  it('should validate simple domain', () => {
    expect(hostname.exec('example.com')).toBe(true);
  });

  it('should validate subdomain', () => {
    expect(hostname.exec('sub.domain.example.com')).toBe(true);
  });

  it('should validate hostname with hyphen', () => {
    expect(hostname.exec('my-server')).toBe(true);
  });

  it('should not validate hostname starting with hyphen', () => {
    expect(hostname.exec('-invalid.com')).toBe(false);
  });

  it('should not validate hostname ending with hyphen', () => {
    expect(hostname.exec('invalid-.com')).toBe(false);
  });

  it('should not validate double dots', () => {
    expect(hostname.exec('invalid..com')).toBe(false);
  });

  it('should not validate URL with protocol', () => {
    expect(hostname.exec('http://example.com')).toBe(false);
  });
});

describe('hostname on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { hostname } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = '-invalid.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value is not a valid hostname']);

    vm.r$.name.$value = 'example.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = '-invalid.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value is not a valid hostname']);

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

describe('hostname on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          hostname: withMessage(hostname, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
