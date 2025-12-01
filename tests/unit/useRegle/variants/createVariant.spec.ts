import {
  createVariant,
  narrowVariant,
  variantToRef,
  useRegle,
  type CommonComparisonOptions,
  type RegleFieldStatus,
  type RegleRuleDefinition,
  type RegleShortcutDefinition,
  inferRules,
} from '@regle/core';
import {
  checked,
  and,
  applyIf,
  literal,
  maxLength,
  minLength,
  minValue,
  numeric,
  withMessage,
  required,
} from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';

describe('createVariant', () => {
  //- Given
  function createRootVariantRegle(initialValue?: 'ONE' | 'TWO' | undefined) {
    type FormVariant = {
      firstName?: string;
    } & (
      | { type: 'ONE'; oneValue: number; oneName: string }
      | { type: 'TWO'; twoValue: number; twoName: string }
      | { type?: undefined }
    );

    const state = ref<FormVariant>({ firstName: '', type: initialValue as any });

    const { r$ } = useRegle(state, () => {
      const variant = createVariant(state, 'type', [
        { type: { literal: literal('TWO') }, twoValue: { numeric, required } },
        { type: { literal: literal('ONE') }, oneValue: { numeric, required, minValue: minValue(4) } },
        { type: { required } },
      ]);
      return {
        firstName: { required },
        ...variant.value,
      };
    });

    const invariantRefOne = variantToRef(r$, 'type', 'ONE');
    const invariantRefTwo = variantToRef(r$, 'type', 'TWO');

    const unsafeInvariantRefOne = variantToRef(r$, 'type', 'ONE', { unsafeAssertion: true });
    const unsafeInvariantRefTwo = variantToRef(r$, 'type', 'TWO', { unsafeAssertion: true });

    return {
      r$,
      invariantRefOne,
      invariantRefTwo,
      unsafeInvariantRefOne,
      unsafeInvariantRefTwo,
    };
  }

  it('should correctly create and discriminate variants', async () => {
    const { vm } = createRegleComponent(createRootVariantRegle);

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
      expectTypeOf(data.firstName).toEqualTypeOf<string>();
      expectTypeOf(data.type).toEqualTypeOf<'ONE' | 'TWO'>();
      expectTypeOf(data.oneValue).toEqualTypeOf<number | undefined>();
      expectTypeOf(data.twoValue).toEqualTypeOf<number | undefined>();
      expectTypeOf(data.oneName).toEqualTypeOf<string | undefined>();
      expectTypeOf(data.twoName).toEqualTypeOf<string | undefined>();
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
        string | undefined,
        {
          required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
        },
        RegleShortcutDefinition<any>
      >
    >();

    if (narrowVariant(vm.r$, 'type', 'ONE')) {
      expect(vm.r$.oneName).toBe(undefined);

      expectTypeOf(vm.r$.$value.type).toEqualTypeOf<'ONE'>();
      expectTypeOf(vm.r$.$value.oneValue).toEqualTypeOf<number | undefined>();

      expectTypeOf(vm.r$.oneName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>> | undefined
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.twoName).toBe(undefined);
      // @ts-expect-error property should not be present here
      expect(vm.r$.twoValue).toBe(undefined);

      shouldBeErrorField(vm.r$.oneValue);

      expectTypeOf(vm.r$.oneValue).toEqualTypeOf<
        RegleFieldStatus<
          number,
          {
            numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
            minValue: RegleRuleDefinition<
              number | string,
              [count: number | string, options?: CommonComparisonOptions | undefined],
              false,
              boolean,
              number | string
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
      expect(vm.r$.twoName).toBe(undefined);
      expectTypeOf(vm.r$.$value.type).toEqualTypeOf<'TWO'>();
      expectTypeOf(vm.r$.$value.twoValue).toEqualTypeOf<number | undefined>();

      expectTypeOf(vm.r$.twoName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>> | undefined
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.oneName).toBe(undefined);

      // @ts-expect-error property should not be present here
      expect(vm.r$.oneValue).toBe(undefined);

      shouldBeErrorField(vm.r$.twoValue);
      expectTypeOf(vm.r$.twoValue).toEqualTypeOf<
        RegleFieldStatus<
          number,
          {
            numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
          },
          RegleShortcutDefinition<any>
        >
      >();
    }

    vm.r$.$value.type = undefined;
    await vm.$nextTick();

    expect(narrowVariant(vm.r$, 'type', 'ONE')).toBe(false);
    expect(narrowVariant(vm.r$, 'type', 'TWO')).toBe(false);

    expectTypeOf(vm.r$.firstName).toEqualTypeOf<
      RegleFieldStatus<
        string | undefined,
        {
          required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
        },
        RegleShortcutDefinition<any>
      >
    >();
  });

  // - Given
  function createNestedVariantRegle() {
    type Form = {
      nested2: { name: string; definedName: string; maybeUndefinedName?: string } & (
        | { type: 'ONE'; oneValue: number; oneName: string }
        | { type: 'TWO'; twoValue: number; twoName: string }
        | { type?: undefined }
      );
    };
    const form = ref<Form>({
      nested2: {
        name: '',
        definedName: '',
      },
    });

    const { r$ } = useRegle(form, () => {
      const variant = createVariant(() => form.value.nested2, 'type', [
        { type: { literal: literal('TWO') }, twoValue: { numeric, required } },
        { type: { literal: literal('ONE') }, oneValue: { numeric, required, minValue: minValue(4) } },
        { type: { required } },
      ]);

      return {
        nested2: {
          name: { required },
          ...variant.value,
        },
      };
    });

    const invariantRefOne = variantToRef(r$.nested2, 'type', 'ONE');
    const invariantRefTwo = variantToRef(r$.nested2, 'type', 'TWO');

    return {
      r$,
      invariantRefOne,
      invariantRefTwo,
    };
  }

  it('should correctly create and discriminate [nested] variants', async () => {
    const { vm } = createRegleComponent(createNestedVariantRegle);

    expect(vm.r$.nested2.name.$invalid).toBe(true);
    // No rules so invalid is false
    expect(vm.r$.nested2.definedName.$invalid).toBe(false);

    // No value or rules
    expect(vm.r$.nested2.maybeUndefinedName).toBe(undefined);

    expectTypeOf(vm.r$.nested2.maybeUndefinedName).toEqualTypeOf<
      RegleFieldStatus<string | undefined, {}, RegleShortcutDefinition<any>> | undefined
    >();

    expect(vm.invariantRefOne).toBe(undefined);
    expect(vm.invariantRefTwo).toBe(undefined);

    // @ts-expect-error unknown field
    expect(vm.r$.nested2.oneValue).toBe(undefined);
    // @ts-expect-error unknown field
    expect(vm.r$.nested2.twoValue).toBe(undefined);

    const { valid, data } = await vm.r$.$validate();

    if (valid) {
      expectTypeOf(data.nested2.name).toEqualTypeOf<string>();
      expectTypeOf(data.nested2.definedName).toEqualTypeOf<string | undefined>();
      expectTypeOf(data.nested2.maybeUndefinedName).toEqualTypeOf<string | undefined>();
      expectTypeOf(data.nested2.type).toEqualTypeOf<'ONE' | 'TWO'>();
      expectTypeOf(data.nested2.oneValue).toEqualTypeOf<number | undefined>();
      expectTypeOf(data.nested2.twoValue).toEqualTypeOf<number | undefined>();
      expectTypeOf(data.nested2.oneName).toEqualTypeOf<string | undefined>();
      expectTypeOf(data.nested2.twoName).toEqualTypeOf<string | undefined>();
    }

    expect(vm.r$.$error).toBe(true);
    shouldBeErrorField(vm.r$.nested2.type);

    vm.r$.$value.nested2.type = 'ONE';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.nested2.type);

    await vm.r$.$validate();
    await vm.$nextTick();

    expect(narrowVariant(vm.r$.nested2, 'type', 'ONE')).toBe(true);
    expect(vm.invariantRefOne).toBeDefined();

    if (narrowVariant(vm.r$.nested2, 'type', 'ONE') && vm.invariantRefOne) {
      expect(vm.r$.nested2.oneName).toBe(undefined);

      expectTypeOf(vm.r$.nested2.$value.type).toEqualTypeOf<'ONE'>();
      expectTypeOf(vm.r$.nested2.$value.oneValue).toEqualTypeOf<number | undefined>();

      expectTypeOf(vm.r$.nested2.oneName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>> | undefined
      >();

      // Invariant
      expectTypeOf(vm.invariantRefOne.$anyEdited).toEqualTypeOf<boolean>();
      expectTypeOf(vm.invariantRefOne.$value.definedName).toEqualTypeOf<string>();
      expectTypeOf(vm.invariantRefOne.definedName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>>
      >();
      expectTypeOf(vm.invariantRefOne.maybeUndefinedName).toEqualTypeOf<
        RegleFieldStatus<string | undefined, {}, RegleShortcutDefinition<any>> | undefined
      >();
      expectTypeOf(vm.invariantRefOne.oneValue).toEqualTypeOf<
        RegleFieldStatus<
          number,
          {
            numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
            minValue: RegleRuleDefinition<
              number | string,
              [count: number | string, options?: CommonComparisonOptions | undefined],
              false,
              boolean,
              number | string
            >;
          },
          RegleShortcutDefinition<any>
        >
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.nested2.twoName).toBe(undefined);
      // @ts-expect-error property should not be present here
      expect(vm.r$.twoValue).toBe(undefined);
      shouldBeErrorField(vm.r$.nested2.oneValue);

      expectTypeOf(vm.r$.nested2.oneValue).toEqualTypeOf<
        RegleFieldStatus<
          number,
          {
            numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
            minValue: RegleRuleDefinition<
              number | string,
              [count: number | string, options?: CommonComparisonOptions | undefined],
              false,
              boolean,
              number | string
            >;
          },
          RegleShortcutDefinition<any>
        >
      >();
    }

    vm.r$.$value.nested2.type = 'TWO';
    await vm.$nextTick();

    await vm.r$.$validate();
    await vm.$nextTick();

    expect(narrowVariant(vm.r$.nested2, 'type', 'TWO')).toBe(true);
    expect(vm.invariantRefOne).toBeUndefined();
    expect(vm.invariantRefTwo).toBeDefined();

    if (narrowVariant(vm.r$.nested2, 'type', 'TWO') && vm.invariantRefTwo) {
      expect(vm.r$.nested2.twoName).toBe(undefined);
      expect(vm.r$.nested2.$fields.twoName).toBe(undefined);

      expectTypeOf(vm.r$.nested2.type.$value).toEqualTypeOf<'TWO'>();
      expectTypeOf(vm.r$.nested2.$value.type).toEqualTypeOf<'TWO'>();
      expectTypeOf(vm.r$.nested2.$value.twoValue).toEqualTypeOf<number | undefined>();

      expectTypeOf(vm.r$.nested2.twoName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>> | undefined
      >();

      // Invariant
      expectTypeOf(vm.invariantRefTwo.definedName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>>
      >();
      expectTypeOf(vm.invariantRefTwo.maybeUndefinedName).toEqualTypeOf<
        RegleFieldStatus<string | undefined, {}, RegleShortcutDefinition<any>> | undefined
      >();
      expectTypeOf(vm.invariantRefTwo.twoValue).toEqualTypeOf<
        RegleFieldStatus<
          number,
          {
            numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
          },
          RegleShortcutDefinition<any>
        >
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.oneName).toBe(undefined);

      // @ts-expect-error property should not be present here
      expect(vm.r$.oneValue).toBe(undefined);

      shouldBeErrorField(vm.r$.nested2.twoValue);
      expectTypeOf(vm.r$.nested2.twoValue).toEqualTypeOf<
        RegleFieldStatus<
          number,
          {
            numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
          },
          RegleShortcutDefinition<any>
        >
      >();
    }
  });

  it('should invoke variantToRef directly', async () => {
    const { vm } = createRegleComponent(() => createRootVariantRegle('ONE'));

    await vm.$nextTick();

    expect(vm.invariantRefOne).toBeDefined();
    expect(vm.invariantRefOne?.oneValue).toBeDefined();
    expect(vm.invariantRefOne?.$fields.oneValue).toBeDefined();
    expectTypeOf(vm.invariantRefOne?.oneValue.$edited).toEqualTypeOf<boolean | undefined>();

    expectTypeOf(vm.unsafeInvariantRefOne.oneValue.$edited).toEqualTypeOf<boolean>();
    expectTypeOf(vm.unsafeInvariantRefOne).not.toBeUndefined();
  });

  it('should expect correct typing with union types', () => {
    type PossibleFormSchemaInput = FixedPriceQuoteFormSchema | TimeAndMaterialsQuoteFormSchema | QuoteFormSchema;

    interface BaseQuoteRequest {
      acceptedTC?: boolean;
      title?: string;
      vatPercent?: number;
    }

    interface QuoteFormSchema extends BaseQuoteRequest {
      type?: undefined;
      details: {};
    }

    interface FixedPriceQuoteFormSchema extends BaseQuoteRequest {
      details: {
        quoteLines: Partial<{
          description: string;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
        }>[];
        additionalNotes?: string;
      };
      type: 'FIXED_PRICE';
    }
    interface TimeAndMaterialsQuoteFormSchema extends BaseQuoteRequest {
      details: {
        projectScope?: string;
        workRate: {
          unit?: 'HOUR' | 'DAY';
          value?: number;
        };
        startDate?: Date;
        estimatedEndDate?: Date;
        estimatedTotalWorkAmount?: number;
      };
      type: 'TIME_AND_MATERIALS';
    }
    interface CreateQuoteStateSchema {
      BILLING_INFORMATION?: {
        billingInformation: {
          firstName?: string;
          lastName?: string;
          workEmail?: string;
          companyAddress: Location;
        };
      };
      QUOTE_SETUP: PossibleFormSchemaInput;
      INVITE_A_CLIENT: {
        companyName?: string;
        firstName?: string;
        lastName?: string;
        workEmail?: string;
        country?: string;
        phoneNumber?: string;
      };
    }

    const quoteVariant = createVariant(() => form.value.QUOTE_SETUP, 'type', [
      {
        type: { literal: literal('FIXED_PRICE') },
        details: {
          quoteLines: {
            required,
            $each() {
              return {
                description: { required },
                quantity: { required },
                unitPrice: { required },
                totalPrice: { required },
              };
            },
          },
          additionalNotes: {
            maxLength: maxLength(100000),
          },
        },
      },
      {
        type: { literal: literal('TIME_AND_MATERIALS') },
        details: {
          projectScope: {
            required,
          },
        },
      },
      {
        type: { required },
      },
    ]);

    const form = ref<CreateQuoteStateSchema>({ QUOTE_SETUP: { type: 'FIXED_PRICE' } } as any);

    inferRules(form, { INVITE_A_CLIENT: {} });
    inferRules(form, {
      QUOTE_SETUP: {
        title: { required, minLength: minLength(1), maxLength: maxLength(200) },
        acceptedTC: {
          $rewardEarly: true,
          checked: withMessage(
            applyIf(
              () => {
                return false;
              },
              and(checked, required)
            ),
            'foo'
          ),
        },
        vatPercent: {},
        ...quoteVariant.value,
      },
      INVITE_A_CLIENT: {
        companyName: { required },
      },
    });
  });
});
