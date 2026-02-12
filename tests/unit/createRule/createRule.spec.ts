import {
  createRule,
  type RegleRuleDefinition,
  type RegleRuleWithParamsDefinition,
  type Maybe,
  useRegle,
} from '@regle/core';
import { createRegleComponent } from '../../utils/test.utils';
import { nextTick } from 'vue';

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
      validator(_value: unknown, _param: boolean = false, _param2: boolean = true) {
        return true;
      },
      message: '',
    });

    expect(rule().exec('fooo')).toBe(true);
    expect(rule(true).exec('fooo')).toBe(true);
    expect(rule(true, true).exec('fooo')).toBe(true);

    expectTypeOf(rule).toEqualTypeOf<
      RegleRuleWithParamsDefinition<unknown, unknown, [param?: boolean, param2?: boolean], false, true>
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

  it('should use validator default parameter in message when omitted', async () => {
    const rule = createRule({
      type: 'rule',
      validator(value: Maybe<string>, prefix: string = 'bar') {
        return {
          $valid: !!value && value.startsWith(prefix),
          prefix,
        };
      },
      message: ({ prefix }) => `Value must start with ${prefix}`,
    });

    function formComponent() {
      return useRegle({ name: '' }, { name: { rule } });
    }

    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'foobar';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['Value must start with bar']);
    expectTypeOf(vm.r$.name.$rules.rule.$metadata).toEqualTypeOf<{ prefix: string }>();

    vm.r$.name.$value = 'barfoo';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);
  });
});
