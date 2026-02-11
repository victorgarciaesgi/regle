import { defineRegleConfig, useRegle } from '@regle/core';
import { exactValue } from '../exactValue';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('exactValue exec', () => {
  it('should validate max number', () => {
    expect(exactValue(5).exec(5)).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(exactValue(5).exec(4)).toBe(false);
  });

  it('should validate the invalid number', () => {
    expect(exactValue(5).exec(6)).toBe(false);
  });

  it('should not validate the string value', () => {
    expect(exactValue(5).exec('not string here' as any)).toBe(true);
  });

  it('should not validate the object value', () => {
    expect(exactValue(5).exec({ hello: 'world' } as any)).toBe(true);
  });
});

describe('exactValue on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ count: 0 }, { count: { exactValue: exactValue(5) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.count.$value = 3;
    await nextTick();
    expect(vm.r$.count.$error).toBe(true);
    expect(vm.r$.count.$errors).toStrictEqual(['The value must be equal to 5']);

    vm.r$.count.$value = 5;
    await nextTick();
    expect(vm.r$.count.$error).toBe(false);
    expect(vm.r$.count.$errors).toStrictEqual([]);

    vm.r$.count.$value = undefined;
    await nextTick();
    expect(vm.r$.count.$error).toBe(false);
    expect(vm.r$.count.$errors).toStrictEqual([]);

    vm.r$.count.$value = 3;
    await nextTick();
    expect(vm.r$.count.$error).toBe(true);
    expect(vm.r$.count.$errors).toStrictEqual(['The value must be equal to 5']);

    vm.r$.count.$value = null as any;
    await nextTick();
    expect(vm.r$.count.$error).toBe(false);
    expect(vm.r$.count.$errors).toStrictEqual([]);
  });
});

describe('exactValue on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          exactValue: withMessage(exactValue, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
