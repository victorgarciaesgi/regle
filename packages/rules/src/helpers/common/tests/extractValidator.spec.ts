import { createRule, InternalRuleType } from '@regle/core';
import { extractValidator } from '../extractValidator';

describe('extractValidator', () => {
  it('should extract inline sync validator', () => {
    const rule = (value: unknown) => !!value;
    const extracted = extractValidator(rule as any);

    expect(extracted._type).toBe(InternalRuleType.Inline);
    expect(extracted._async).toBe(false);
    expect(extracted.validator('x')).toBe(true);
  });

  it('should extract inline async validator', () => {
    const rule = async (value: unknown) => !!value;
    const extracted = extractValidator(rule as any);

    expect(extracted._type).toBe(InternalRuleType.Inline);
    expect(extracted._async).toBe(true);
  });

  it('should extract validator from rule definitions', () => {
    const rule = createRule({
      type: 'custom',
      validator: (value: unknown, expected: unknown) => value === expected,
      message: 'Error',
      active: true,
    })(1);
    const extracted = extractValidator(rule);

    expect(extracted._type).toBe('custom');
    expect(extracted._params).toHaveLength(1);
    expect(extracted._active).toBe(true);
    expect(extracted.validator(1, 1)).toBe(true);
  });

  it('should throw on invalid rules', () => {
    expect(() => extractValidator({} as any)).toThrowError('Cannot extract validator from invalid rule');
  });
});
