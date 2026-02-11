import { defineRegleConfig, useRegle } from '@regle/core';
import { requiredIf } from '../requiredIf';
import { createRegleComponent } from './utils';
import { nextTick, ref } from 'vue';
import { withMessage } from '../..';

describe('requiredIf exec', () => {
  it('should not validate empty string when functional condition is met', () => {
    expect(requiredIf(true).exec('')).toBe(false);
  });

  it('should validate empty string when functional condition not met', () => {
    expect(requiredIf(false).exec('')).toBe(true);
  });

  it('should not validate empty string when simple boolean condition is met', () => {
    // @ts-expect-error
    expect(requiredIf('prop').exec('')).toBe(false);
  });

  it('should validate empty string when simple boolean condition not met', () => {
    // @ts-expect-error
    expect(requiredIf('').exec('')).toBe(true);
  });

  it('should validate string only with spaces', () => {
    expect(requiredIf(true).exec('  ')).toBe(false);
  });

  it('should work with a ref', () => {
    const prop = ref(false);
    // make sure if passed a `false` ref, it returns `true` directly
    expect(requiredIf(prop).exec(false)).toBe(true);
    prop.value = true;
    expect(requiredIf(prop).exec('')).toBe(false);
    expect(requiredIf(prop).exec('1')).toBe(true);
  });
});

describe('requiredIf on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      const condition = ref(true);
      return {
        ...useRegle({ name: '' }, { name: { requiredIf: requiredIf(condition) } }),
        condition,
      };
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$touch();

    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['This field is required']);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = '';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['This field is required']);

    vm.condition = false;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);
  });
});

describe('requiredIf on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          requiredIf: withMessage(requiredIf, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
