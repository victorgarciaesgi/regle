import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { regex } from '../regex';

describe('regex exec', () => {
  it('does not validate falsy values', () => {
    expect(regex(/ad/).exec('')).toBe(true);
    expect(regex(/ad/).exec(null)).toBe(true);
  });
  it('validates truthy values against regex', () => {
    expect(regex(/ad/).exec('aaa')).toBe(false);
    expect(regex(/ad/).exec('ad')).toBe(true);
    expect(regex([/^a.*d$/, /\d{3}/]).exec('ads')).toBe(false);
    expect(regex([/^a.*d$/, /\d{3}/]).exec('a123d')).toBe(true);
  });
});

describe('regex on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { regex: regex(/^[a-z]+$/) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = '123';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must match the required pattern']);

    vm.r$.name.$value = 'abc';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = '123';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must match the required pattern']);

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

describe('regex on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          regex: withMessage(regex, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
