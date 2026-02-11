import { defineRegleConfig, useRegle, type RegleRuleDefinition, type MaybeInput } from '@regle/core';
import { nativeEnum } from '../nativeEnum';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

const Food = {
  Meat: 'Meat',
  Fish: 'Fish',
} as const;

const Position = {
  One: 1,
  Two: 2,
} as const;

describe('nativeEnum exec', () => {
  it('should not validate invalid value', () => {
    expect(nativeEnum(Food).exec(5)).toBe(false);
  });

  it('should validate valid string', () => {
    expect(nativeEnum(Food).exec(Food.Meat)).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(nativeEnum(Position).exec(Position.One)).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(nativeEnum(Position).exec('foo')).toBe(false);
  });

  it('should validate undefined value', () => {
    expect(nativeEnum(Position).exec(undefined)).toBe(true);
  });

  it('should validate undefined option', () => {
    expect(nativeEnum(undefined as any).exec(5)).toBe(true);
  });

  const nativeEnumRule = nativeEnum(Food);
  expectTypeOf(nativeEnumRule).toEqualTypeOf<
    RegleRuleDefinition<
      'nativeEnum',
      MaybeInput<'Meat' | 'Fish'>,
      [
        enumLike: {
          readonly Meat: 'Meat';
          readonly Fish: 'Fish';
        },
      ],
      false,
      boolean,
      MaybeInput<'Meat' | 'Fish'>,
      string | number
    >
  >();
});

describe('nativeEnum on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' as string }, { name: { nativeEnum: nativeEnum(Food) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'Invalid';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be one of the following: Meat, Fish']);

    vm.r$.name.$value = 'Meat';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'Invalid';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be one of the following: Meat, Fish']);

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

describe('nativeEnum on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          nativeEnum: withMessage(nativeEnum, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
