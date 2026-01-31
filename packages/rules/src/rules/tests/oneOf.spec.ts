import { oneOf } from '../oneOf';
import type { RegleRuleDefinition, MaybeInput } from '@regle/core';

describe('oneOf validator', () => {
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
