import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { contains } from '../contains';

describe('contains exec', () => {
  it('should not validate different values', () => {
    expect(contains('foo').exec('bar')).toBe(false);
  });

  it('should not validate undefined values', () => {
    expect(contains(undefined).exec(undefined)).toBe(true);
  });

  it('should not validate undefined param', () => {
    expect(contains(undefined).exec('any')).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(contains('any').exec(undefined)).toBe(true);
  });

  it('should validate a value containing parameter', () => {
    expect(contains('ir').exec('first')).toBe(true);
  });
});

describe('contains on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { contains: contains('foo') } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'bar';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must contain foo']);

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
    expect(vm.r$.name.$errors).toStrictEqual(['The value must contain foo']);

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

describe('contains on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          contains: withMessage(contains, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
