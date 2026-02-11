import { defineRegleConfig, useRegle } from '@regle/core';
import { between } from '../between';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('between exec', () => {
  it('should validate empty string', () => {
    expect(between(2, 3).exec(2)).toBe(true);
  });

  it('should validate numeric zero in range', () => {
    expect(between(-1, 1).exec(0)).toBe(true);
  });

  it('should not validate numeric zero outside of range', () => {
    expect(between(2, 3).exec(0)).toBe(false);
  });

  it('should not validate input outside of range', () => {
    expect(between(5, 10).exec(15)).toBe(false);
    expect(between(5, 10).exec(3)).toBe(false);
  });

  it('should have inclusive lower bound', () => {
    expect(between(5, 10).exec(5)).toBe(true);
  });

  it('should not have inclusive lower bound without allowEqual', () => {
    expect(between(5, 10, { allowEqual: false }).exec(5)).toBe(false);
  });

  it('should not have inclusive lower bound without allowEqual', () => {
    expect(between(5, 10, { allowEqual: false }).exec(10)).toBe(false);
  });

  it('should have inclusive upper bound', () => {
    expect(between(3, 4).exec(4)).toBe(true);
  });

  it('should validate exact number in point range', () => {
    expect(between(3, 3).exec(3)).toBe(true);
  });

  it('should not validate number just outside of range', () => {
    expect(between(3, 3).exec(3)).toBe(true);
  });

  it('should skip text', () => {
    expect(between(3, 3).exec('hello' as any)).toBe(true);
  });

  it('should skip number-like text', () => {
    expect(between(3, 3).exec('15a' as any)).toBe(true);
  });

  it('should skip padded numbers', () => {
    expect(between(5, 20).exec(' 15' as any)).toBe(true);
    expect(between(5, 20).exec('15 ' as any)).toBe(true);
  });

  it('should validate fractions', () => {
    expect(between(3, 16).exec('15.5' as any)).toBe(true);
  });

  it('should validate negative fractions on bound', () => {
    expect(between(-15.512, 4.56).exec('-15.512' as any)).toBe(true);
  });

  it('should validate real numbers', () => {
    expect(between(3, 16).exec(15.5)).toBe(true);
  });

  it('should not validate real numbers outside of range', () => {
    expect(between(3, 16).exec(25.5)).toBe(false);
  });

  it('should skip NaN', () => {
    expect(between(3, 16).exec(NaN)).toBe(true);
    expect(between(3, NaN).exec(3)).toBe(true);
  });

  it('should skip non numbers', () => {
    expect(between(3, 16).exec('hello' as any)).toBe(true);
    expect(between(3, 16).exec({ hello: 'world' } as any)).toBe(true);
  });
});

describe('between on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ count: 0 }, { count: { between: between(5, 10) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.count.$value = 3;
    await nextTick();
    expect(vm.r$.count.$error).toBe(true);
    expect(vm.r$.count.$errors).toStrictEqual(['The value must be between 5 and 10']);

    vm.r$.count.$value = 7;
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
    expect(vm.r$.count.$errors).toStrictEqual(['The value must be between 5 and 10']);

    vm.r$.count.$value = null as any;
    await nextTick();
    expect(vm.r$.count.$error).toBe(false);
    expect(vm.r$.count.$errors).toStrictEqual([]);
  });
});

describe('between on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          between: withMessage(between, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
