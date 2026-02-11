import { defineRegleConfig, useRegle } from '@regle/core';
import { ipv4Address } from '../ipv4Address';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('ipv4Address exec', () => {
  it('should validate undefined', () => {
    expect(ipv4Address.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(ipv4Address.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(ipv4Address.exec('')).toBe(true);
  });

  it('should not validate number', () => {
    expect(ipv4Address.exec(123123123123 as any)).toBe(false);
  });

  it('should validate basic loopback', () => {
    expect(ipv4Address.exec('127.0.0.1')).toBe(true);
  });

  it('should validate public address 1', () => {
    expect(ipv4Address.exec('8.8.8.8')).toBe(true);
  });

  it('should validate public address 2', () => {
    expect(ipv4Address.exec('123.41.12.168')).toBe(true);
  });

  it('should validate private address', () => {
    expect(ipv4Address.exec('10.0.0.1')).toBe(true);
  });

  it('should validate private address with multiple zeros', () => {
    expect(ipv4Address.exec('10.0.0.0')).toBe(true);
  });

  it('should not validate padded loopback', () => {
    expect(ipv4Address.exec(' 127.0.0.1 ')).toBe(false);
  });

  it('should not validate nonzero nibbles starting with 0', () => {
    expect(ipv4Address.exec('127.0.00.1')).toBe(false);
  });

  it('should not validate not enough nibbles', () => {
    expect(ipv4Address.exec('127.0.1')).toBe(false);
  });

  it('should not validate too many nibbles', () => {
    expect(ipv4Address.exec('10.0.1.2.3')).toBe(false);
  });

  it('should not validate negatives', () => {
    expect(ipv4Address.exec('1.2.3.-4')).toBe(false);
  });

  it('should not validate too big values', () => {
    expect(ipv4Address.exec('1.256.3.4')).toBe(false);
  });

  it('should not validate masks', () => {
    expect(ipv4Address.exec('10.0.0.1/24')).toBe(false);
  });
});

describe('ipv4Address on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { ipv4Address } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = '999.999.999.999';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value is not a valid IPv4 address']);

    vm.r$.name.$value = '127.0.0.1';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = '999.999.999.999';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value is not a valid IPv4 address']);

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

describe('ipv4Address on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          ipv4Address: withMessage(ipv4Address, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
