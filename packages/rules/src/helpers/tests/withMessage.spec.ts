import type { Maybe, RegleRuleDefinition, RegleRuleWithParamsDefinition } from '@regle/core';
import { useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { and } from '../and';
import { dateBefore, email, minLength, oneOf, required, sameAs } from '../../rules';
import { withMessage } from '../withMessage';
import { withAsync } from '../withAsync';
import { isFilled } from '../ruleHelpers';
import { withParams } from '../withParams';
import type { CommonComparisonOptions } from '@regle/core';

describe('withMessage helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        firstName: '',
        lastName: '',
        testOverride: '',
      });

      const overriddenRule = withMessage(minLength, ({ $params: [min] }) => `Test override: ${min}`);

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

  const { vm } = mount(testComponent);

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
    expect(vm.r$.$fields.testOverride.$errors).toStrictEqual(['Test override: 6']);
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

    vi.advanceTimersByTimeAsync(1000);
    await nextTick();
    await flushPromises();

    expect(vm.r$.$errors.firstName).toStrictEqual([]);
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$errors.lastName).toStrictEqual(['Required async']);
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
      RegleRuleDefinition<unknown, [], false, boolean, unknown>
    >();

    // Correct return type with inline rule and metadata
    expectTypeOf(withMessage((value) => ({ $valid: true, foo: 'bar' }), 'Required')).toEqualTypeOf<
      RegleRuleDefinition<
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
          required: withMessage((value) => true, ''),
        },
      }
    );

    useRegle(
      { firstName: '' },
      {
        firstName: {
          required: withMessage(
            (value) => {
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

    // @ts-expect-error no message argument ❌
    withMessage((value) => true);

    // @ts-expect-error incorrect return type ❌
    withMessage((value) => {}, 'Message');

    // Correct type with async value returning metadata
    expectTypeOf(withMessage(async (value) => ({ $valid: true, foo: 'bar' }), 'Required')).toEqualTypeOf<
      RegleRuleDefinition<
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
        async (value) => ({ $valid: true, foo: 'bar' }),
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
        (value) => ({ $valid: true, foo: 'bar' }),
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
        (value) => {
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
        string | any[] | Record<PropertyKey, any>,
        [count: number, options?: CommonComparisonOptions | undefined],
        false,
        boolean
      >
    >();

    withMessage(sameAs, ({ $value, $params: [target, otherName] }) => {
      expectTypeOf(otherName).toEqualTypeOf<string | undefined>();
      return 'test';
    });

    withMessage(oneOf, ({ $value, $params: [options] }) => {
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
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [], true, boolean, unknown>>();

    expectTypeOf(
      withMessage(
        withParams(
          (value) => {
            return true;
          },
          [() => true]
        ),
        'Required async'
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [boolean], false, true, unknown>>();
  });
});
