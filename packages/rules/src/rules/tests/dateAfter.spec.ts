import { defineRegleConfig, useRegle } from '@regle/core';
import { dateAfter } from '../dateAfter';
import { withMessage } from '../..';
import { createRegleComponent } from '../../../../../tests/utils/test.utils';
import { nextTick } from 'vue';

describe('dateAfter exec', () => {
  it('should validate undefined value and param', () => {
    expect(dateAfter(undefined).exec(undefined)).toBe(true);
  });

  it('should validate undefined param', () => {
    expect(dateAfter(undefined).exec(new Date())).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateAfter(new Date()).exec(undefined)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateAfter('').exec('')).toBe(true);
  });

  it('should not validate string value', () => {
    expect(dateAfter('abde').exec('')).toBe(true);
  });

  it('should validate a date after', () => {
    expect(dateAfter(new Date(2013)).exec(new Date(2014))).toBe(true);
  });

  it('should not validate a date before', () => {
    expect(dateAfter(new Date(2013)).exec(new Date(2012))).toBe(false);
  });

  it('should validate an identical date', () => {
    expect(dateAfter(new Date(2013)).exec(new Date(2013))).toBe(true);
  });

  it('should not validate an identical date without allowEqual', () => {
    expect(dateAfter(new Date(2013), { allowEqual: false }).exec(new Date(2013))).toBe(false);
  });
});

describe('dateAfter on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ date: new Date() }, { date: { dateAfter: dateAfter(new Date(2013, 0, 1)) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.date.$value = new Date(2012, 0, 1);
    await nextTick();
    expect(vm.r$.date.$error).toBe(true);
    expect(vm.r$.date.$errors).toStrictEqual(['The date must be after 1/1/13']);

    vm.r$.date.$value = new Date(2014, 0, 1);
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);

    vm.r$.date.$value = undefined as any;
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);

    vm.r$.date.$value = new Date(2012, 0, 1);
    await nextTick();
    expect(vm.r$.date.$error).toBe(true);
    expect(vm.r$.date.$errors).toStrictEqual(['The date must be after 1/1/13']);

    vm.r$.date.$value = null as any;
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);
  });
});

describe('dateAfter on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          dateAfter: withMessage(dateAfter, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
