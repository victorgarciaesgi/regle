import { defineRegleConfig, useRegle } from '@regle/core';
import { required } from '../required';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('required exec', () => {
  it('should not validate empty string', () => {
    expect(required.exec('')).toBe(false);
  });

  it('should not validate empty arrays', () => {
    expect(required.exec([])).toBe(false);
  });

  it('should validate nonempty arrays', () => {
    expect(required.exec([1])).toBe(true);
  });

  it('should not validate empty objects', () => {
    expect(required.exec({})).toBe(true);
  });

  it('should validate nonempty objects', () => {
    expect(required.exec({ a: 1 })).toBe(true);
  });

  it('should not validate undefined', () => {
    expect(required.exec(undefined)).toBe(false);
  });

  it('should not validate null', () => {
    expect(required.exec(null)).toBe(false);
  });

  it('should validate false', () => {
    expect(required.exec(false)).toBe(true);
  });

  it('should validate true', () => {
    expect(required.exec(true)).toBe(true);
  });

  it('should validate string only with spaces', () => {
    expect(required.exec('  ')).toBe(false);
  });

  it('should validate english words', () => {
    expect(required.exec('hello')).toBe(true);
  });

  it('should validate padded words', () => {
    expect(required.exec(' hello ')).toBe(true);
  });

  it('should validate unicode', () => {
    expect(required.exec('🎉')).toBe(true);
  });

  it('should validate correct date', () => {
    expect(required.exec(new Date(1234123412341))).toBe(true);
  });

  it('should not validate invalid date', () => {
    expect(required.exec(new Date('a'))).toBe(false);
  });
});

describe('required on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { required } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = '';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['This field is required']);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['This field is required']);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = null as any;
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['This field is required']);
  });
});

describe('required on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          required: withMessage(required, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
