import { sameAs } from '../sameAs';
import type { RegleRuleDefinition, MaybeInput } from '@regle/core';

describe('sameAs validator', () => {
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
