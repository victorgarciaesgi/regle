import { RegleRuleDefinition, RegleRuleMetadataDefinition, useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { Ref, defineComponent, ref } from 'vue';
import { and } from '../../helpers/and';
import { email, minLength, required } from '../../validators';
import { withMessage } from '../withMessage';
import { withAsync } from '../../helpers/withAsync';
import { ruleHelpers } from '../../helpers/ruleHelpers';

describe('withMessage helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        firstName: '',
        lastName: '',
      });

      const { $errors, validateForm, $regle } = useRegle(form, () => ({
        email: {
          email: withMessage(and(minLength(4), email), (value, { $params: [count] }) => {
            return ['Must be email', `Must be min: ${count}`];
          }),
        },
        firstName: {
          required: withMessage(required, 'Required'),
          minLength: withMessage(minLength(4), (value, { $params: [count] }) => {
            return `Value: ${value} Min: ${count}`;
          }),
        },
        lastName: {
          foo: withMessage(
            withAsync(async (value) => {
              return await new Promise<boolean>((resolve) => resolve(ruleHelpers.isFilled(value)));
            }),
            'Required async'
          ),
        },
      }));

      return { form, $errors, validateForm, $regle };
    },
  });

  const { vm } = mount(testComponent);

  it('should return empty errors', () => {
    expect(vm.$errors.email).toStrictEqual([]);
    expect(vm.$errors.firstName).toStrictEqual([]);
  });

  it('should return errors when submitting no values', async () => {
    const result = await vm.validateForm();
    expect(result).toBe(false);
    expect(vm.$errors.email).toStrictEqual([]);
    expect(vm.$errors.firstName).toStrictEqual(['Required']);
  });

  it('should return errors when submitting with incorrect values', async () => {
    vm.form.firstName = 'foo';
    vm.form.email = 'foo';
    vm.form.lastName = 'foo';
    await flushPromises();
    // await vm.validateForm();
    expect(vm.$errors.firstName).toStrictEqual(['Value: foo Min: 4']);
    expect(vm.$errors.email).toStrictEqual(['Must be email', `Must be min: 4`]);
  });

  it('should return no errors when submitting with correct values', async () => {
    vm.form.firstName = 'foobar';
    vm.form.email = 'foo@bar.fr';
    vm.form.lastName = '';
    await flushPromises();
    // await vm.validateForm();
    expect(vm.$errors.firstName).toStrictEqual([]);
    expect(vm.$errors.email).toStrictEqual([]);
    expect(vm.$errors.lastName).toStrictEqual(['Required async']);
  });

  it('should have correct types', () => {
    expectTypeOf(withMessage(required, 'Required')).toEqualTypeOf<
      RegleRuleDefinition<unknown, [], boolean, RegleRuleMetadataDefinition, unknown>
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

    expectTypeOf(
      withMessage(async (value) => ({ $valid: true, foo: 'bar' }), 'Required')
    ).toEqualTypeOf<
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
      withMessage(and(minLength(4), email), (value, { $params: [count] }) => {
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
      withMessage(minLength(4), (value, { $params: [count] }) => {
        return `Value: ${value} Min: ${count}`;
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
          return await new Promise<boolean>((resolve) => resolve(ruleHelpers.isFilled(value)));
        }),
        'Required async'
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [], true, boolean, unknown>>();
  });
});
