import { createRule } from '@regle/core';
import {
  combineRules,
  computeCombinedMetadata,
  computeRulesResults,
  extractParamsFromRules,
  isAnyRuleAsync,
} from '../operatorsLogic';

describe('operatorsLogic', () => {
  it('should detect async rules in mixed rule arrays', () => {
    const syncRule = createRule({
      type: 'sync',
      validator: (value: unknown) => !!value,
      message: 'Error',
    });
    const asyncRule = async (value: unknown) => !!value;

    expect(isAnyRuleAsync([syncRule, asyncRule] as any)).toBe(true);
    expect(isAnyRuleAsync([syncRule] as any)).toBe(false);
  });

  it('should extract params and compute results with indexed params', () => {
    const withParam = createRule({
      type: 'eq',
      validator: (value: unknown, expected: unknown) => value === expected,
      message: 'Error',
    })(1);
    const noParam = createRule({
      type: 'truthy',
      validator: (value: unknown) => !!value,
      message: 'Error',
    });

    const params = extractParamsFromRules([noParam, withParam, (v: unknown) => !!v] as any);
    expect(params).toHaveLength(1);

    const results = computeRulesResults([withParam, noParam] as any, 1, 1);
    expect(results).toStrictEqual([true, true]);
  });

  it('should compute combined metadata for xor and metadata merges', () => {
    expect(computeCombinedMetadata('x', [true, false], 'xor')).toBe(true);

    const merged = computeCombinedMetadata(
      'x',
      [
        { $valid: false, foo: 'a' },
        { $valid: true, bar: 'b' },
      ],
      'or'
    ) as any;
    expect(merged.$valid).toBe(true);
    expect(merged.foo).toBe('a');
    expect(merged.bar).toBe('b');
  });

  it('should return false for empty combinations', () => {
    const result = combineRules([] as any, { mode: 'and', message: 'Error' });
    expect(result.exec('x')).toBe(false);
  });
});
