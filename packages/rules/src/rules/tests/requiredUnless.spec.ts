import { defineRegleConfig, useRegle } from '@regle/core';
import { requiredUnless } from '../requiredUnless';
import { createRegleComponent } from './utils';
import { nextTick, ref } from 'vue';
import { withMessage } from '../..';

describe('requiredUnless exec', () => {
  it('should not validate if prop is falsy', () => {
    expect(requiredUnless(false).exec('')).toBe(false);
    expect(requiredUnless(false).exec('truthy value')).toBe(true);
  });

  it('should not validate when prop condition is truthy', async () => {
    expect(requiredUnless(true).exec('')).toBe(true);
    expect(requiredUnless(true).exec('truthy value')).toBe(true);
  });

  it('should validate string only with spaces', () => {
    expect(requiredUnless(false).exec('  ')).toBe(false);
  });

  it('should work with a ref', () => {
    const prop = ref(true);
    expect(requiredUnless(prop).exec(true)).toBe(true);
    prop.value = false;
    expect(requiredUnless(prop).exec('')).toBe(false);
    expect(requiredUnless(prop).exec('1')).toBe(true);
  });
});

describe('requiredUnless on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      const condition = ref(false);
      return {
        ...useRegle({ name: '' }, { name: { requiredUnless: requiredUnless(condition) } }),
        condition,
      };
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$touch();

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = '';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['This field is required']);

    vm.condition = true;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);
  });
});

describe('requiredUnless on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          requiredUnless: withMessage(requiredUnless, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
