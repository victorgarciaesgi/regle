import { createRule, type RegleRuleDefinition, type RegleRuleWithParamsDefinition } from '@regle/core';

describe('createRule', () => {
  it('should error when creating a rule without a function', () => {
    assert.throw(() => createRule({} as any), '[createRule] validator must be a function');
  });

  it('should create a rule definition without parameters', () => {
    const rule = createRule({
      validator() {
        return true;
      },
      message: '',
      type: 'test',
    });

    expect(rule.exec('fooo')).toBe(true);
    expectTypeOf(rule).toEqualTypeOf<RegleRuleDefinition<'test', unknown, [], false, true, unknown, unknown, false>>();
  });

  it('should handle metadata', () => {
    const rule = createRule({
      validator() {
        return { $valid: true };
      },
      message: '',
      type: 'test',
    });

    expect(rule.exec('fooo')).toBe(true);
    expectTypeOf(rule).toEqualTypeOf<
      RegleRuleDefinition<
        'test',
        unknown,
        [],
        false,
        {
          $valid: true;
        },
        unknown,
        unknown,
        false
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
    expectTypeOf(rule).toEqualTypeOf<
      RegleRuleDefinition<
        unknown,
        unknown,
        [],
        true,
        {
          $valid: true;
        },
        unknown,
        unknown,
        false
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

  it('should recognize multiple parameters with default', async () => {
    const rule = createRule({
      validator(_value, _param = false, _param2 = true) {
        return true;
      },
      message: '',
    });

    expect(rule().exec('fooo')).toBe(true);
    expect(rule(true).exec('fooo')).toBe(true);
    expect(rule(true, true).exec('fooo')).toBe(true);

    expectTypeOf(rule).toEqualTypeOf<
      RegleRuleWithParamsDefinition<unknown, unknown, [param?: any, param2?: any], false, true>
    >();
  });

  it('should recognize multiple parameters with spread', async () => {
    const rule = createRule({
      validator(_value, ..._params: boolean[]) {
        return true;
      },
      message: '',
      type: 'test',
    });

    expect(rule().exec('fooo')).toBe(true);
    expect(rule(true).exec('fooo')).toBe(true);
    expect(rule(true, true).exec('fooo')).toBe(true);

    expectTypeOf(rule).toEqualTypeOf<RegleRuleWithParamsDefinition<'test', unknown, boolean[], false, true>>();
  });
});
