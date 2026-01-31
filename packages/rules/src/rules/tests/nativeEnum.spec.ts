import { nativeEnum } from '../nativeEnum';
import type { RegleRuleDefinition, MaybeInput } from '@regle/core';

const Food = {
  Meat: 'Meat',
  Fish: 'Fish',
} as const;

const Position = {
  One: 1,
  Two: 2,
} as const;

describe('nativeEnum validator', () => {
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
