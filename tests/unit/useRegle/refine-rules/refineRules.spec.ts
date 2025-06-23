import {
  createVariant,
  narrowVariant,
  refineRules,
  useRegle,
  type CommonComparisonOptions,
  type InferInput,
  type MaybeInput,
  type MaybeOutput,
  type RegleFieldStatus,
  type RegleRuleDefinition,
  type RegleShortcutDefinition,
} from '@regle/core';
import { literal, minLength, minValue, number, numeric, required, sameAs, string, type } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';

describe('refineRules', () => {
  function simpleRefinedRulesState() {
    const rules = refineRules(
      {
        count: { number },
        firstName: { string },
        lastName: { required, string },
        password: { required, string, minLength: minLength(4) },
      },
      (state) => {
        return {
          firstName: { required, minLength: minLength(() => state.value.count) },
          confirmPassword: { required, sameAs: sameAs(() => state.value.password) },
        };
      }
    );

    const state = ref<InferInput<typeof rules>>({});

    expectTypeOf<ReturnType<typeof rules>['confirmPassword']>().toEqualTypeOf<{
      required: RegleRuleDefinition<unknown, [], false, boolean, unknown, unknown>;
      sameAs: RegleRuleDefinition<
        MaybeInput<string>,
        [target: MaybeInput<string>, otherName?: string | undefined],
        false,
        boolean,
        MaybeInput<string>,
        MaybeInput<string>
      >;
    }>();

    expectTypeOf<ReturnType<typeof rules>['firstName']>().toEqualTypeOf<{
      required: RegleRuleDefinition<unknown, [], false, boolean, unknown, unknown>;
      minLength: RegleRuleDefinition<
        string | any[] | Record<PropertyKey, any>,
        [count: number, options?: CommonComparisonOptions | undefined],
        false,
        boolean,
        unknown,
        string | any[] | Record<PropertyKey, any>
      >;
    }>();

    return useRegle(state, rules);
  }

  it('should correctly refine rules with the update state', async () => {
    const { vm } = createRegleComponent(simpleRefinedRulesState);

    shouldBeInvalidField(vm.r$);
    shouldBeInvalidField(vm.r$.password);
    shouldBeInvalidField(vm.r$.confirmPassword);

    vm.r$.$value.password = 'foobar';
    await vm.$nextTick();
    vm.r$.$value.confirmPassword = 'bar';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.password);
    shouldBeErrorField(vm.r$.confirmPassword);

    vm.r$.$value.confirmPassword = 'foobar';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.confirmPassword);
  });

  function simpleVariantForm() {
    const rules = refineRules(
      {
        firstName: { required },
        type: { type: type<'ONE' | 'TWO' | undefined>() },
      },
      (state) => {
        const variant = createVariant(state, 'type', [
          { type: { literal: literal('TWO') }, twoValue: { numeric, required }, twoName: { string } },
          {
            type: { literal: literal('ONE') },
            oneValue: { numeric, required, minValue: minValue(4) },
            oneName: { string },
          },
          { type: { required, type: type<undefined>() } },
        ]);
        return {
          ...variant.value,
        };
      }
    );

    const state = ref<InferInput<typeof rules>>({});

    return useRegle(state, rules);
  }

  it('should work with variants', async () => {
    const { vm } = createRegleComponent(simpleVariantForm);

    expect(vm.r$.firstName.$invalid).toBe(true);

    // @ts-expect-error unknown field
    expect(vm.r$.oneValue).toBe(undefined);
    // @ts-expect-error unknown field
    expect(vm.r$.twoValue).toBe(undefined);

    // @ts-expect-error unknown key
    narrowVariant(vm.r$, 'NOT_KNOWN', 'ONE');

    // @ts-expect-error unknown value
    narrowVariant(vm.r$, 'type', 'NOT_ASSIGNABLE');

    const { valid, data } = await vm.r$.$validate();

    if (valid) {
      expectTypeOf(data.firstName).toEqualTypeOf<unknown>();
      expectTypeOf(data.type).toEqualTypeOf<'ONE' | 'TWO'>();
      expectTypeOf(data.oneValue).toEqualTypeOf<MaybeOutput<number>>();
      expectTypeOf(data.twoValue).toEqualTypeOf<MaybeOutput<number | string>>();
      expectTypeOf(data.oneName).toEqualTypeOf<MaybeOutput<string>>();
      expectTypeOf(data.twoName).toEqualTypeOf<MaybeOutput<string>>();
    }

    expect(vm.r$.$error).toBe(true);
    shouldBeErrorField(vm.r$.type);

    vm.r$.$value.type = 'ONE';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.type);

    await vm.r$.$validate();
    await vm.$nextTick();

    expect(narrowVariant(vm.r$, 'type', 'ONE')).toBe(true);

    expectTypeOf(vm.r$.firstName).toEqualTypeOf<
      RegleFieldStatus<
        unknown,
        {
          required: RegleRuleDefinition<unknown, [], false, boolean, unknown, unknown>;
        },
        RegleShortcutDefinition<any>
      >
    >();

    if (narrowVariant(vm.r$, 'type', 'ONE')) {
      expectTypeOf(vm.r$.oneName).toEqualTypeOf<
        RegleFieldStatus<
          MaybeInput<string>,
          {
            string: RegleRuleDefinition<unknown, [], false, boolean, MaybeInput<string>, unknown>;
          },
          RegleShortcutDefinition<any>
        >
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.twoName).toBe(undefined);
      // @ts-expect-error property should not be present here
      expect(vm.r$.twoValue).toBe(undefined);

      shouldBeErrorField(vm.r$.oneValue);

      expectTypeOf(vm.r$.oneValue).toEqualTypeOf<
        RegleFieldStatus<
          MaybeInput<number>,
          {
            numeric: RegleRuleDefinition<
              string | number,
              [],
              false,
              boolean,
              MaybeInput<string | number>,
              string | number
            >;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown, unknown>;
            minValue: RegleRuleDefinition<
              number,
              [count: number, options?: CommonComparisonOptions | undefined],
              false,
              boolean,
              MaybeInput<number>,
              number
            >;
          },
          RegleShortcutDefinition<any>
        >
      >();
    }

    vm.r$.$value.type = 'TWO';
    await vm.$nextTick();

    await vm.r$.$validate();
    await vm.$nextTick();

    expect(narrowVariant(vm.r$, 'type', 'TWO')).toBe(true);

    if (narrowVariant(vm.r$, 'type', 'TWO')) {
      expectTypeOf(vm.r$.twoName).toEqualTypeOf<
        RegleFieldStatus<
          MaybeInput<string>,
          {
            string: RegleRuleDefinition<unknown, [], false, boolean, MaybeInput<string>, unknown>;
          },
          RegleShortcutDefinition<any>
        >
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.oneName).toBe(undefined);

      // @ts-expect-error property should not be present here
      expect(vm.r$.oneValue).toBe(undefined);

      shouldBeErrorField(vm.r$.twoValue);
      expectTypeOf(vm.r$.twoValue).toEqualTypeOf<
        RegleFieldStatus<
          MaybeInput<string | number>,
          {
            numeric: RegleRuleDefinition<
              string | number,
              [],
              false,
              boolean,
              MaybeInput<string | number>,
              string | number
            >;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown, unknown>;
          },
          RegleShortcutDefinition<any>
        >
      >();
    }

    vm.r$.$value.type = undefined;
    await vm.$nextTick();

    expect(narrowVariant(vm.r$, 'type', 'ONE')).toBe(false);
    expect(narrowVariant(vm.r$, 'type', 'TWO')).toBe(false);
  });
});
