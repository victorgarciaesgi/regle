import { defineRegleConfig, useRegle } from '@regle/core';
import { dateBefore } from '../dateBefore';
import { withMessage } from '../..';
import { createRegleComponent } from '../../../../../tests/utils/test.utils';
import { nextTick } from 'vue';

describe('dateBefore exec', () => {
  it('should validate undefined value and param', () => {
    expect(dateBefore(undefined).exec(undefined)).toBe(true);
  });

  it('should validate undefined param', () => {
    expect(dateBefore(undefined).exec(new Date())).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateBefore(new Date()).exec(undefined)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateBefore('').exec('')).toBe(true);
  });

  it('should not validate string value', () => {
    expect(dateBefore('abde').exec('')).toBe(true);
  });

  it('should not validate string value', () => {
    expect(dateBefore('abde').exec('ezezfnr')).toBe(false);
  });

  it('should not validate wrong number value', () => {
    expect(dateBefore(101929020 as any).exec(new Date().getTime() as any)).toBe(false);
  });

  it('should not validate wrong type', () => {
    expect(dateBefore(true as any).exec(true as any)).toBe(false);
  });

  it('should validate a date before', () => {
    expect(dateBefore(new Date(2013)).exec(new Date(2012))).toBe(true);
  });

  it('should not validate a date after', () => {
    expect(dateBefore(new Date(2013)).exec(new Date(2014))).toBe(false);
  });

  it('should validate an identical date', () => {
    expect(dateBefore(new Date(2013)).exec(new Date(2013))).toBe(true);
  });

  it('should not validate an identical date without allowEqual', () => {
    expect(dateBefore(new Date(2013), { allowEqual: false }).exec(new Date(2013))).toBe(false);
  });
});

describe('dateBefore on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ date: new Date() }, { date: { dateBefore: dateBefore(new Date(2013, 0, 1)) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.date.$value = new Date(2012, 0, 1);
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);

    vm.r$.date.$value = new Date(2014, 0, 1);
    await nextTick();
    expect(vm.r$.date.$error).toBe(true);
    expect(vm.r$.date.$errors).toStrictEqual(['The date must be before 1/1/13']);

    vm.r$.date.$value = undefined as any;
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);

    vm.r$.date.$value = new Date(2012, 0, 1);
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);

    vm.r$.date.$value = null as any;
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);
  });
});

describe('dateBefore on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          dateBefore: withMessage(dateBefore, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
