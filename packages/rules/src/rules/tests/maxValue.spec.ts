import { defineRegleConfig, useRegle } from '@regle/core';
import { maxValue } from '../maxValue';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('maxValue exec', () => {
  it('should validate max number', () => {
    expect(maxValue(5).exec(5)).toBe(true);
  });

  it('should not validate max number without allowEqual', () => {
    expect(maxValue(5, { allowEqual: false }).exec(5)).toBe(false);
  });

  it('should validate the valid number', () => {
    expect(maxValue(5).exec(4)).toBe(true);
  });

  it('should validate the invalid number', () => {
    expect(maxValue(5).exec(6)).toBe(false);
  });

  it('should skip the string value', () => {
    expect(maxValue(5).exec('not string here' as any)).toBe(true);
  });

  it('should skip the object value', () => {
    expect(maxValue(5).exec({ hello: 'world' } as any)).toBe(true);
  });

  it('should work with string values', () => {
    expect(maxValue('10').exec('5')).toBe(true);
    expect(maxValue('5').exec('10')).toBe(false);
  });

  it('should skip NaN values', () => {
    expect(maxValue('ezfzef').exec(5)).toBe(true);
    expect(maxValue(5).exec('ezfmjze')).toBe(true);
  });
});

describe('maxValue on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ count: 0 }, { count: { maxValue: maxValue(5) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.count.$value = 10;
    await nextTick();
    expect(vm.r$.count.$error).toBe(true);
    expect(vm.r$.count.$errors).toStrictEqual(['The value must be less than or equal to 5']);

    vm.r$.count.$value = 3;
    await nextTick();
    expect(vm.r$.count.$error).toBe(false);
    expect(vm.r$.count.$errors).toStrictEqual([]);

    vm.r$.count.$value = undefined;
    await nextTick();
    expect(vm.r$.count.$error).toBe(false);
    expect(vm.r$.count.$errors).toStrictEqual([]);

    vm.r$.count.$value = 10;
    await nextTick();
    expect(vm.r$.count.$error).toBe(true);
    expect(vm.r$.count.$errors).toStrictEqual(['The value must be less than or equal to 5']);

    vm.r$.count.$value = null as any;
    await nextTick();
    expect(vm.r$.count.$error).toBe(false);
    expect(vm.r$.count.$errors).toStrictEqual([]);
  });
});

describe('maxValue on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          maxValue: withMessage(maxValue, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
