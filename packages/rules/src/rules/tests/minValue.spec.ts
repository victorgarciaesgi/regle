import { defineRegleConfig, useRegle } from '@regle/core';
import { minValue } from '../minValue';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('minValue exec', () => {
  it('should validate min number', () => {
    expect(minValue(5).exec(5)).toBe(true);
  });

  it('should not validate min number without allowEqual', () => {
    expect(minValue(5, { allowEqual: false }).exec(5)).toBe(false);
  });

  it('should validate the valid number', () => {
    expect(minValue(5).exec(6)).toBe(true);
  });

  it('should validate the invalid number', () => {
    expect(minValue(5).exec(4)).toBe(false);
  });

  it('should skip the string value', () => {
    expect(minValue(5).exec('not string here' as any)).toBe(true);
  });

  it('should skip the object value', () => {
    expect(minValue(5).exec({ hello: 'world' } as any)).toBe(true);
  });

  it('should work with string values', () => {
    expect(minValue('5').exec('10')).toBe(true);
    expect(minValue('10').exec('5')).toBe(false);
  });

  it('should skip with NaN values', () => {
    expect(minValue('ezfzef').exec(5)).toBe(true);
    expect(minValue(5).exec('ezfmjze')).toBe(true);
  });
});

describe('minValue on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ count: 0 }, { count: { minValue: minValue(5) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.count.$value = 3;
    await nextTick();
    expect(vm.r$.count.$error).toBe(true);
    expect(vm.r$.count.$errors).toStrictEqual(['The value must be greater than or equal to 5']);

    vm.r$.count.$value = 6;
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
    expect(vm.r$.count.$errors).toStrictEqual(['The value must be greater than or equal to 5']);

    vm.r$.count.$value = null as any;
    await nextTick();
    expect(vm.r$.count.$error).toBe(false);
    expect(vm.r$.count.$errors).toStrictEqual([]);
  });
});

describe('minValue on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          minValue: withMessage(minValue, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
