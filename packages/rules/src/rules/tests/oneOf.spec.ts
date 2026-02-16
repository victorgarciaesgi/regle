import { defineRegleConfig, useRegle, type RegleRuleDefinition, type MaybeInput } from '@regle/core';
import { oneOf } from '../oneOf';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('oneOf exec', () => {
  it('should not validate invalid value', () => {
    expect(oneOf(['One', 'Two']).exec(5)).toBe(false);
  });

  it('should work with readonly arrays', () => {
    const values = ['One', 'Two'] as const;
    expect(oneOf(values).exec(5)).toBe(false);
  });

  it('should validate valid string', () => {
    expect(oneOf(['One', 'Two']).exec('Two')).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(oneOf([4, 5]).exec(4)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(oneOf([4, 5, 6]).exec(undefined)).toBe(true);
  });

  it('should not validate empty array', () => {
    expect(oneOf([] as any).exec('Foo')).toBe(false);
  });

  it('should validate undefined option', () => {
    expect(oneOf(undefined as any).exec(5)).toBe(true);
  });

  it('should work with enumLikes', () => {
    const enumLike = {
      One: 'One',
      Two: 'Two',
    } as const;

    const oneOfRule = oneOf(enumLike);
    expectTypeOf(oneOfRule).toEqualTypeOf<
      RegleRuleDefinition<
        'oneOf',
        'One' | 'Two',
        [options: 'One' | 'Two'],
        false,
        boolean,
        MaybeInput<'One' | 'Two'>,
        string | number,
        boolean
      >
    >();
    expect(oneOfRule.exec('One')).toBe(true);

    expect(oneOfRule.exec('Two')).toBe(true);
    expect(oneOfRule.exec(undefined)).toBe(true);
    expect(oneOfRule.exec(5)).toBe(false);
    expect(oneOfRule.exec('Three')).toBe(false);
    expect(oneOfRule.exec('')).toBe(true);
    expect(oneOfRule.exec(null as any)).toBe(true);
    expect(oneOfRule.exec(undefined as any)).toBe(true);
  });

  const oneOfRule = oneOf(['One', 'Two']);
  expectTypeOf(oneOfRule).toEqualTypeOf<
    RegleRuleDefinition<
      'oneOf',
      'One' | 'Two',
      [options: ['One', 'Two']],
      false,
      boolean,
      MaybeInput<'One' | 'Two'>,
      string | number
    >
  >();

  expectTypeOf(oneOf(['One', 'Two'] as string[])).toEqualTypeOf<
    RegleRuleDefinition<'oneOf', string, [options: string[]], false, boolean, MaybeInput<string>, string | number>
  >();
});

describe('oneOf on useRegle', () => {
  it('should work with useRegle and enumLike', async () => {
    const enumLike = {
      One: 'One',
      Two: 'Two',
    } as const;
    return useRegle({ name: '' as keyof typeof enumLike | undefined }, { name: { oneOf: oneOf(enumLike) } });
  });

  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' as string | number }, { name: { oneOf: oneOf(['One', 'Two']) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'Three';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be one of the following: One, Two']);

    vm.r$.name.$value = 'One';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'Three';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be one of the following: One, Two']);

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

describe('oneOf on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          oneOf: withMessage(oneOf, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
