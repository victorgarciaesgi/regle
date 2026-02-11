import { defineRegleConfig, useRegle, type RegleRuleDefinition } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick, ref } from 'vue';
import { withMessage } from '../..';
import { sameAs } from '../sameAs';

describe('sameAs exec', () => {
  it('should not validate different values', () => {
    expect(sameAs('empty').exec('any' as any)).toBe(false);
  });

  it('should not validate undefined values', () => {
    expect(sameAs(undefined).exec(undefined)).toBe(true);
  });

  it('should not validate undefined param', () => {
    expect(sameAs(undefined).exec('any' as any)).toBe(false);
  });

  it('should validate undefined value', () => {
    expect(sameAs('any').exec(undefined)).toBe(true);
  });

  it('should validate identical values', () => {
    expect(sameAs('first').exec('first')).toBe(true);
  });

  const sameAsRule = sameAs(() => 'foo');

  expectTypeOf(sameAsRule).toEqualTypeOf<
    RegleRuleDefinition<
      'sameAs',
      string,
      [target: string, otherName?: string | undefined],
      false,
      boolean,
      string,
      unknown,
      false
    >
  >();
});

describe('sameAs on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      const target = ref('expected');
      return {
        ...useRegle({ name: '' }, { name: { sameAs: sameAs(target) } }),
        target,
      };
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$touch();

    vm.r$.name.$value = 'other';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be equal to the other value']);

    vm.target = 'other';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'expected';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be equal to the other value']);
  });
});

describe('sameAs on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          sameAs: withMessage(sameAs, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
