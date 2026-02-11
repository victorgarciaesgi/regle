import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { endsWith } from '../endsWith';

describe('endsWith exec', () => {
  it('should not validate different values', () => {
    expect(endsWith('ba').exec('bar')).toBe(false);
  });

  it('should not validate undefined values', () => {
    expect(endsWith(undefined).exec(undefined)).toBe(true);
  });

  it('should not validate undefined param', () => {
    expect(endsWith(undefined).exec('any')).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(endsWith('any').exec(undefined)).toBe(true);
  });

  it('should validate a value containing parameter', () => {
    expect(endsWith('st').exec('first')).toBe(true);
  });

  it('should skip non-string param', () => {
    expect(endsWith('any').exec(123 as any)).toBe(true);
  });

  it('should skip non-string value', () => {
    expect(endsWith('any').exec(123 as any)).toBe(true);
  });
});

describe('endsWith on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { endsWith: endsWith('foo') } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'bar';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must end with foo']);

    vm.r$.name.$value = 'barfoo';
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
    expect(vm.r$.name.$errors).toStrictEqual(['The value must end with foo']);

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

describe('endsWith on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          endsWith: withMessage(endsWith, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
