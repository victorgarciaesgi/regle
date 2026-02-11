import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { startsWith } from '../startsWith';

describe('startsWith exec', () => {
  it('should not validate different values', () => {
    expect(startsWith('ar').exec('bar')).toBe(false);
  });

  it('should not validate undefined values', () => {
    expect(startsWith(undefined).exec(undefined)).toBe(true);
  });

  it('should not validate undefined param', () => {
    expect(startsWith(undefined).exec('any')).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(startsWith('any').exec(undefined)).toBe(true);
  });

  it('should validate a value containing parameter', () => {
    expect(startsWith('fir').exec('first')).toBe(true);
  });

  it('should skip non-string param', () => {
    expect(startsWith('any').exec(123 as any)).toBe(true);
  });

  it('should skip non-string value', () => {
    expect(startsWith('any').exec(123 as any)).toBe(true);
  });
});

describe('startsWith on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { startsWith: startsWith('foo') } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'bar';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must start with foo']);

    vm.r$.name.$value = 'foobar';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'bar';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must start with foo']);

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

describe('startsWith on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          startsWith: withMessage(startsWith, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
