import { createRule, type RegleRuleDefinition, type RegleRuleWithParamsDefinition } from '@regle/core';

describe('createRule', () => {
  it('should error when creating a rule without a function', () => {
    assert.throw(() => createRule({} as any), 'Validator must be a function');
  });

  it('should create a rule definition without parameters', () => {
    const rule = createRule({
      validator() {
        return true;
      },
      message: '',
    });

    expect(rule.exec('fooo')).toBe(true);
    expectTypeOf(rule).toMatchTypeOf<RegleRuleDefinition<unknown, [], false, true, unknown>>();
  });

  it('should handle metadata', () => {
    const rule = createRule({
      validator() {
        return { $valid: true };
      },
      message: '',
    });

    expect(rule.exec('fooo')).toBe(true);
    expectTypeOf(rule).toMatchTypeOf<
      RegleRuleDefinition<
        unknown,
        [],
        false,
        {
          $valid: true;
        },
        unknown
      >
    >();
  });

  it('should handle async metadata', async () => {
    const rule = createRule({
      async validator() {
        return Promise.resolve({ $valid: true });
      },
      message: '',
    });

    expect(await rule.exec('fooo')).toBe(true);
    expectTypeOf(rule).toMatchTypeOf<
      RegleRuleDefinition<
        unknown,
        [],
        true,
        {
          $valid: true;
        },
        unknown
      >
    >();
  });

  it('should be false if not given boolean or $valid response', async () => {
    const rule = createRule({
      validator() {
        return 'foo' as unknown as boolean;
      },
      message: '',
    });

    expect(rule.exec('fooo')).toBe(false);
  });

  it('should recognize mutliple parameters with default', async () => {
    const rule = createRule({
      validator(value, param = false, param2 = true) {
        return true;
      },
      message: '',
    });

    expect(rule().exec('fooo')).toBe(true);
    expect(rule(true).exec('fooo')).toBe(true);
    expect(rule(true, true).exec('fooo')).toBe(true);

    expectTypeOf(rule).toEqualTypeOf<
      RegleRuleWithParamsDefinition<unknown, [param?: any, param2?: any], false, true>
    >();
  });

  it('should recognize mutliple parameters with spread', async () => {
    const rule = createRule({
      validator(value, ...params: boolean[]) {
        return true;
      },
      message: '',
    });

    expect(rule().exec('fooo')).toBe(true);
    expect(rule(true).exec('fooo')).toBe(true);
    expect(rule(true, true).exec('fooo')).toBe(true);

    expectTypeOf(rule).toEqualTypeOf<RegleRuleWithParamsDefinition<unknown, boolean[], false, true>>();
  });
});
