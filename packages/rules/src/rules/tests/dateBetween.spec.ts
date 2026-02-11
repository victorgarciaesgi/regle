import { defineRegleConfig, useRegle } from '@regle/core';
import { dateBetween } from '../dateBetween';
import { withMessage } from '../..';
import { createRegleComponent } from '../../../../../tests/utils/test.utils';
import { nextTick } from 'vue';

describe('dateBetween exec', () => {
  it('should validate undefined value and param', () => {
    expect(dateBetween(undefined, undefined).exec(undefined)).toBe(true);
  });

  it('should validate undefined param', () => {
    expect(dateBetween(undefined, undefined).exec(new Date())).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateBetween(new Date(), undefined).exec(undefined)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateBetween('', '').exec('')).toBe(true);
  });

  it('should not validate string value', () => {
    expect(dateBetween('abde', 'abcde').exec('')).toBe(true);
  });

  it('should validate a date between', () => {
    expect(dateBetween(new Date(2013), new Date(2015)).exec(new Date(2014))).toBe(true);
  });

  it('should not validate a date after', () => {
    expect(dateBetween(new Date(2013), new Date(2015)).exec(new Date(2012))).toBe(false);
  });

  it('should not validate an identical date', () => {
    const rule = dateBetween(new Date(2013), new Date(2015));
    expect(rule.exec(new Date(2013))).toBe(true);
    expect(rule.exec(new Date(2015))).toBe(true);
  });

  it('should not validate an identical date without allowEqual', () => {
    const rule = dateBetween(new Date(2013), new Date(2015), { allowEqual: false });
    expect(rule.exec(new Date(2013))).toBe(false);
    expect(rule.exec(new Date(2015))).toBe(false);
  });
});

describe('dateBetween on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle(
        { date: new Date() },
        { date: { dateBetween: dateBetween(new Date(2013, 0, 1), new Date(2015, 0, 1)) } }
      );
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.date.$value = new Date(2012, 0, 1);
    await nextTick();
    expect(vm.r$.date.$error).toBe(true);
    expect(vm.r$.date.$errors).toStrictEqual(['The date must be between 1/1/13 and 1/1/15']);

    vm.r$.date.$value = new Date(2014, 0, 1);
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);

    vm.r$.date.$value = undefined as any;
    await nextTick();
    expect(vm.r$.date.$error).toBe(false);
    expect(vm.r$.date.$errors).toStrictEqual([]);
  });
});

describe('dateBetween on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          dateBetween: withMessage(dateBetween, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
