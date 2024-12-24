import type { RegleRuleDefinition } from '@regle/core';
import { useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { and } from '../and';
import { email, minLength, required } from '../../rules';
import { withMessage } from '../withMessage';
import { withAsync } from '../withAsync';
import { isFilled } from '../ruleHelpers';

describe('withMessage helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        firstName: '',
        lastName: '',
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
    const [{ result }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);
    expect(result).toBe(false);
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$errors.firstName).toStrictEqual(['Required']);
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

  it('should have correct types', () => {
    expectTypeOf(withMessage(required, 'Required')).toEqualTypeOf<
      RegleRuleDefinition<unknown, [], false, boolean, unknown>
    >();

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

    expectTypeOf(
      withMessage(and(minLength(4), email), ({ $params: [count] }) => {
        return ['Must be email', `Must be min: ${count}`];
      })
    ).toEqualTypeOf<
      RegleRuleDefinition<
        string | any[] | Record<PropertyKey, any>,
        [number],
        false,
        boolean,
        string | any[] | Record<PropertyKey, any>
      >
    >();

    expectTypeOf(
      withMessage(minLength(4), ({ $value, $params: [count] }) => {
        return `Value: ${$value} Min: ${count}`;
      })
    ).toEqualTypeOf<
      RegleRuleDefinition<
        string | any[] | Record<PropertyKey, any>,
        [count: number],
        false,
        boolean,
        string | any[] | Record<PropertyKey, any>
      >
    >();

    expectTypeOf(
      withMessage(
        withAsync(async (value) => {
          return await new Promise<boolean>((resolve) => resolve(isFilled(value)));
        }),
        'Required async'
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [], true, boolean, unknown>>();
  });
});
