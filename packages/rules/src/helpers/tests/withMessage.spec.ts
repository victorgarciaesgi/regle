import type { CommonComparisonOptions, Maybe, RegleRuleDefinition, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule, useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { dateBefore, email, minLength, oneOf, required, sameAs } from '../../rules';
import { and } from '../and';
import { isFilled } from '../ruleHelpers';
import { withAsync } from '../withAsync';
import { withMessage } from '../withMessage';
import { withParams } from '../withParams';

describe('withMessage helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        firstName: '',
        lastName: '',
        testOverride: '',
        pseudo: '',
      });

      const overriddenRule = withMessage(minLength, ({ $params: [min] }) => `Test override: ${min}`);

      const asyncCreateRule = createRule({
        validator: async (value, _param: number) => {
          return await new Promise<boolean>((resolve) => {
            setTimeout(() => {
              resolve(isFilled(value));
            }, 200);
          });
        },
        message: 'Create rule async',
      });

      return useRegle(form, () => ({
        email: {
          email: withMessage(and(minLength(4), email), ({ $params: [count] }) => {
            return ['Must be email', `Must be min: ${count}`];
          }),
        },
        firstName: {
          required: withMessage(required, 'Required'),
          minLength: withMessage(minLength(4), ({ $value, $params: [count] }) => {
            return `Value: ${$value} Min: ${count}`;
          }),
        },
        lastName: {
          foo: withMessage(
            withAsync(async (value) => {
              return await new Promise<boolean>((resolve) => resolve(isFilled(value)));
            }),
            'Required async'
          ),
        },
        pseudo: {
          ruleAsync: withMessage(asyncCreateRule(2), 'Required async'),
        },
        testOverride: {
          foo: overriddenRule(6),
        },
      }));
    },
    template: '<div></div>',
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const { vm } = mount(testComponent, {});

  it('should return empty errors', () => {
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$errors.firstName).toStrictEqual([]);
  });

  it('should return errors when submitting no values', async () => {
    const [{ valid }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);
    expect(valid).toBe(false);
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$errors.firstName).toStrictEqual(['Required']);
  });

  it('should handle overridden rules with params', async () => {
    vm.r$.$value.testOverride = 'foo';
    await nextTick();
    expect(vm.r$.testOverride.$errors).toStrictEqual(['Test override: 6']);
    expect(vm.r$.testOverride.$errors).toStrictEqual(['Test override: 6']);
  });

  it('should return errors when submitting with incorrect values', async () => {
    vm.r$.$value.firstName = 'foo';
    vm.r$.$value.email = 'foo';
    vm.r$.$value.lastName = 'foo';

    await flushPromises();

    expect(vm.r$.$errors.firstName).toStrictEqual(['Value: foo Min: 4']);
    expect(vm.r$.$errors.email).toStrictEqual(['Must be email', `Must be min: 4`]);
  });

  it('should return no errors when submitting with correct values', async () => {
    vm.r$.$value.firstName = 'foobar';
    vm.r$.$value.email = 'foo@bar.fr';
    vm.r$.$value.lastName = '';

    await nextTick();

    vi.advanceTimersByTimeAsync(200);
    await nextTick();
    await flushPromises();

    expect(vm.r$.$errors.firstName).toStrictEqual([]);
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$errors.lastName).toStrictEqual(['Required async']);
  });

  it('should correctly keep async handlers', async () => {
    vm.r$.$value.pseudo = 'foo';
    await nextTick();
    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();
    await flushPromises();
    expect(vm.r$.pseudo.$error).toBe(false);
    expect(vm.r$.$errors.pseudo).toStrictEqual([]);
  });

  it('should create a rule factory when passed a rule factory', async () => {
    const customMinLength = withMessage(minLength, ({ $params: [count] }) => {
      return `Must be min: ${count}`;
    });

    expect(typeof customMinLength).toStrictEqual('function');
  });

  it('should have correct types', () => {
    // Correct return type with a built-in rule
    expectTypeOf(withMessage(required, 'Required')).toEqualTypeOf<
      RegleRuleDefinition<'required', unknown, [], false, boolean, unknown>
    >();

    // Correct return type with inline rule and metadata
    expectTypeOf(withMessage((_value) => ({ $valid: true, foo: 'bar' }), 'Required')).toEqualTypeOf<
      RegleRuleDefinition<
        unknown,
        unknown,
        [],
        false,
        {
          $valid: true;
          foo: string;
        },
        unknown
      >
    >();

    useRegle(
      { name: '' },
      {
        name: {
          required: withMessage((_value) => true, ''),
        },
      }
    );

    useRegle(
      { firstName: '' },
      {
        firstName: {
          required: withMessage(
            (value: Maybe<string>) => {
              expectTypeOf(value).toEqualTypeOf<Maybe<string>>();
              return true;
            },
            ({ $value }) => {
              expectTypeOf($value).toEqualTypeOf<Maybe<string>>();
              return '';
            }
          ),
        },
      }
    );

    useRegle('' as string, {
      required: withMessage(
        (_value: Maybe<string>) => {
          return true;
        },
        ({ $value }) => {
          expectTypeOf($value).toEqualTypeOf<Maybe<string>>();
          return '';
        }
      ),
    });

    // @ts-expect-error no message argument ❌
    withMessage((_value) => true);

    // @ts-expect-error incorrect return type ❌
    withMessage((_value) => {}, 'Message');

    // Correct type with async value returning metadata
    expectTypeOf(withMessage(async (_value) => ({ $valid: true, foo: 'bar' }), 'Required')).toEqualTypeOf<
      RegleRuleDefinition<
        unknown,
        unknown,
        [],
        true,
        {
          $valid: true;
          foo: string;
        },
        unknown
      >
    >();

    // Correct type with async value returning metadata
    expectTypeOf(
      withMessage(
        async (_value) => ({ $valid: true, foo: 'bar' }),
        ({ foo, $params }) => {
          expectTypeOf(foo).toEqualTypeOf<string>();
          expectTypeOf($params).toEqualTypeOf<[]>();
          return '';
        }
      )
    );

    // Correct type with async value returning metadata
    expectTypeOf(
      withMessage(
        (_value) => ({ $valid: true, foo: 'bar' }),
        ({ foo, $params }) => {
          expectTypeOf(foo).toEqualTypeOf<string>();
          expectTypeOf($params).toEqualTypeOf<[]>();
          return '';
        }
      )
    );

    // Correct type with async value returning metadata
    expectTypeOf(
      withMessage(
        (_value) => {
          const condition: boolean = false;
          if (condition) {
            return { $valid: false, custom: 0 };
          }
          return { $valid: true, data: { firstName: 'Victor' } };
        },
        ({ custom, data, $params }) => {
          expectTypeOf(custom).toEqualTypeOf<number | undefined>();
          expectTypeOf(data).toEqualTypeOf<
            | {
                firstName: string;
              }
            | undefined
          >();
          expectTypeOf($params).toEqualTypeOf<[]>();
          return '';
        }
      )
    );

    withMessage(dateBefore(new Date()), ({ error }) => {
      expectTypeOf(error).toEqualTypeOf<'date-not-before' | 'value-or-parameter-not-a-date' | undefined>();
      return '';
    });

    withMessage(and(minLength(4), email), ({ $params: [count] }) => {
      expectTypeOf(count).toEqualTypeOf<number>();
      return ['Must be email', `Must be min: ${count}`];
    });

    // Correct types with using modifiers
    expectTypeOf(
      withMessage(and(minLength(4), email), ({ $params: [count] }) => {
        return ['Must be email', `Must be min: ${count}`];
      })
    ).toEqualTypeOf<
      RegleRuleDefinition<
        'and',
        string | any[] | Record<PropertyKey, any>,
        [count: number, options?: CommonComparisonOptions | undefined],
        false,
        boolean,
        string | any[] | Record<PropertyKey, any>
      >
    >();

    // Correct types when accessing $params from function
    expectTypeOf(
      withMessage(minLength(4), ({ $value, $params: [count] }) => {
        return `Value: ${$value} Min: ${count}`;
      })
    ).toEqualTypeOf<
      RegleRuleDefinition<
        'minLength',
        string | any[] | Record<PropertyKey, any>,
        [count: number, options?: CommonComparisonOptions | undefined],
        false,
        boolean,
        string | any[] | Record<PropertyKey, any>
      >
    >();

    const message = withMessage(minLength, ({ $value, $params: [count] }) => {
      expectTypeOf(count).toEqualTypeOf<number>();
      return `Minimum length is ${count}. Current length: ${$value?.length}`;
    });

    expectTypeOf(message).toEqualTypeOf<
      RegleRuleWithParamsDefinition<
        'minLength',
        string | any[] | Record<PropertyKey, any>,
        [count: number, options?: CommonComparisonOptions | undefined],
        false,
        boolean
      >
    >();

    withMessage(sameAs, ({ $params: [_, otherName] }) => {
      expectTypeOf(otherName).toEqualTypeOf<string | undefined>();
      return 'test';
    });

    withMessage(oneOf, ({ $params: [options] }) => {
      expectTypeOf(options).toEqualTypeOf<readonly [string | number, ...(string | number)[]]>();
      return 'test';
    });

    expectTypeOf(
      withMessage(
        withAsync(async (value) => {
          return await new Promise<boolean>((resolve) => resolve(isFilled(value)));
        }),
        'Required async'
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, unknown, [], true, boolean, unknown>>();

    expectTypeOf(
      withMessage(
        withParams(() => {
          return true;
        }, [() => true]),
        'Required async'
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, unknown, [boolean], false, true, unknown>>();
  });
});
