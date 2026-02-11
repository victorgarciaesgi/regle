import { defineRegleConfig, useRegle } from '@regle/core';
import { checked } from '../checked';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('checked exec', () => {
  it('should not validate undefined values', () => {
    expect(checked.exec(null)).toBe(false);
    expect(checked.exec(undefined)).toBe(false);
  });

  it('should validate true value', () => {
    expect(checked.exec(true)).toBe(true);
  });

  it('should not validate false value', () => {
    expect(checked.exec(false)).toBe(false);
  });
});

describe('checked on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ agree: false as any }, { agree: { checked } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.agree.$value = true;
    await nextTick();
    expect(vm.r$.agree.$error).toBe(false);
    expect(vm.r$.agree.$errors).toStrictEqual([]);

    vm.r$.agree.$value = false;
    await nextTick();
    expect(vm.r$.agree.$error).toBe(true);
    expect(vm.r$.agree.$errors).toStrictEqual(['The field must be checked']);

    vm.r$.agree.$value = true;
    await nextTick();
    expect(vm.r$.agree.$error).toBe(false);
    expect(vm.r$.agree.$errors).toStrictEqual([]);

    vm.r$.agree.$value = undefined;
    await nextTick();
    expect(vm.r$.agree.$error).toBe(true);
    expect(vm.r$.agree.$errors).toStrictEqual(['The field must be checked']);

    vm.r$.agree.$value = true;
    await nextTick();
    expect(vm.r$.agree.$error).toBe(false);
    expect(vm.r$.agree.$errors).toStrictEqual([]);

    vm.r$.agree.$value = null as any;
    await nextTick();
    expect(vm.r$.agree.$error).toBe(true);
    expect(vm.r$.agree.$errors).toStrictEqual(['The field must be checked']);
  });
});

describe('checked on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          checked: withMessage(checked, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
