import { defineRegleConfig, useRegle } from '@regle/core';
import { httpUrl } from '../httpUrl';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('httpUrl exec', () => {
  it('should validate undefined', () => {
    expect(httpUrl.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(httpUrl.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(httpUrl.exec('')).toBe(true);
  });

  it('should validate http URL', () => {
    expect(httpUrl.exec('http://example.com')).toBe(true);
  });

  it('should validate https URL', () => {
    expect(httpUrl.exec('https://example.com')).toBe(true);
  });

  it('should validate URL with path and query', () => {
    expect(httpUrl.exec('http://example.com:8080/path?query=1')).toBe(true);
  });

  it('should not validate ftp URL', () => {
    expect(httpUrl.exec('ftp://example.com')).toBe(false);
  });

  it('should not validate mailto URL', () => {
    expect(httpUrl.exec('mailto:test@example.com')).toBe(false);
  });

  it('should validate https with custom protocol option', () => {
    expect(httpUrl({ protocol: /^https$/ }).exec('https://example.com')).toBe(true);
  });

  it('should not validate http when https required', () => {
    expect(httpUrl({ protocol: /^https$/ }).exec('http://example.com')).toBe(false);
  });
});

describe('httpUrl on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { httpUrl } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'ftp://example.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value is not a valid http URL address']);

    vm.r$.name.$value = 'http://example.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'ftp://example.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value is not a valid http URL address']);

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

describe('httpUrl on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          httpUrl: withMessage(httpUrl, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
