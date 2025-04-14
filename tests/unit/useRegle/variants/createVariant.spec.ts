import {
  createVariant,
  narrowVariant,
  variantToRef,
  useRegle,
  type CommonComparationOptions,
  type RegleFieldStatus,
  type RegleRuleDefinition,
  type RegleShortcutDefinition,
} from '@regle/core';
import { literal, minValue, numeric, required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';

describe('createVariant', () => {
  //- Given
  function createRootVariantRegle() {
    type FormVariant = {
      firstName?: string;
    } & (
      | { type: 'ONE'; oneValue: number; oneName: string }
      | { type: 'TWO'; twoValue: number; twoName: string }
      | { type?: undefined }
    );

    const state = ref<FormVariant>({ firstName: '' });

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

    return {
      r$,
      invariantRefOne,
      invariantRefTwo,
    };
  }

  it('should correctly create and discriminate variants', async () => {
    const { vm } = createRegleComponent(createRootVariantRegle);

    expect(vm.r$.$fields.firstName.$invalid).toBe(true);

    // @ts-expect-error unknown field
    expect(vm.r$.$fields.oneValue).toBe(undefined);
    // @ts-expect-error unknown field
    expect(vm.r$.$fields.twoValue).toBe(undefined);

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
    shouldBeErrorField(vm.r$.$fields.type);

    vm.r$.$value.type = 'ONE';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.type);

    await vm.r$.$validate();
    await vm.$nextTick();

    expect(narrowVariant(vm.r$.$fields, 'type', 'ONE')).toBe(true);

    expectTypeOf(vm.r$.$fields.firstName).toEqualTypeOf<
      RegleFieldStatus<
        string | undefined,
        {
          required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
        },
        RegleShortcutDefinition<any>
      >
    >();

    if (narrowVariant(vm.r$.$fields, 'type', 'ONE')) {
      expect(vm.r$.$fields.oneName).toBe(undefined);

      expectTypeOf(vm.r$.$fields.oneName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>> | undefined
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.twoName).toBe(undefined);
      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.twoValue).toBe(undefined);
      shouldBeErrorField(vm.r$.$fields.oneValue);

      expectTypeOf(vm.r$.$fields.oneValue).toEqualTypeOf<
        RegleFieldStatus<
          number,
          {
            numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
            minValue: RegleRuleDefinition<
              number,
              [count: number, options?: CommonComparationOptions | undefined],
              false,
              boolean,
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

    expect(narrowVariant(vm.r$.$fields, 'type', 'TWO')).toBe(true);

    if (narrowVariant(vm.r$.$fields, 'type', 'TWO')) {
      expect(vm.r$.$fields.twoName).toBe(undefined);
      expectTypeOf(vm.r$.$fields.twoName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>> | undefined
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.oneName).toBe(undefined);

      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.oneValue).toBe(undefined);

      shouldBeErrorField(vm.r$.$fields.twoValue);
      expectTypeOf(vm.r$.$fields.twoValue).toEqualTypeOf<
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

    const invariantRefOne = variantToRef(r$.$fields.nested2, 'type', 'ONE');
    const invariantRefTwo = variantToRef(r$.$fields.nested2, 'type', 'TWO');

    return {
      r$,
      invariantRefOne,
      invariantRefTwo,
    };
  }

  it('should correctly create and discriminate [nested] variants', async () => {
    const { vm } = createRegleComponent(createNestedVariantRegle);

    expect(vm.r$.$fields.nested2.$fields.name.$invalid).toBe(true);
    // No rules so invalid is false
    expect(vm.r$.$fields.nested2.$fields.definedName.$invalid).toBe(false);

    // No value or rules
    expect(vm.r$.$fields.nested2.$fields.maybeUndefinedName).toBe(undefined);

    expectTypeOf(vm.r$.$fields.nested2.$fields.maybeUndefinedName).toEqualTypeOf<
      RegleFieldStatus<string | undefined, {}, RegleShortcutDefinition<any>> | undefined
    >();

    expect(vm.invariantRefOne).toBe(undefined);
    expect(vm.invariantRefTwo).toBe(undefined);

    // @ts-expect-error unknown field
    expect(vm.r$.$fields.nested2.$fields.oneValue).toBe(undefined);
    // @ts-expect-error unknown field
    expect(vm.r$.$fields.nested2.$fields.twoValue).toBe(undefined);

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
    shouldBeErrorField(vm.r$.$fields.nested2.$fields.type);

    vm.r$.$value.nested2.type = 'ONE';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.nested2.$fields.type);

    await vm.r$.$validate();
    await vm.$nextTick();

    expect(narrowVariant(vm.r$.$fields.nested2.$fields, 'type', 'ONE')).toBe(true);
    expect(vm.invariantRefOne).toBeDefined();

    if (narrowVariant(vm.r$.$fields.nested2.$fields, 'type', 'ONE') && vm.invariantRefOne) {
      expect(vm.r$.$fields.nested2.$fields.oneName).toBe(undefined);

      expectTypeOf(vm.r$.$fields.nested2.$fields.oneName).toEqualTypeOf<
        RegleFieldStatus<string, {}, RegleShortcutDefinition<any>> | undefined
      >();

      // Invariant
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
              number,
              [count: number, options?: CommonComparationOptions | undefined],
              false,
              boolean,
              number
            >;
          },
          RegleShortcutDefinition<any>
        >
      >();

      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.nested2.$fields.twoName).toBe(undefined);
      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.twoValue).toBe(undefined);
      shouldBeErrorField(vm.r$.$fields.nested2.$fields.oneValue);

      expectTypeOf(vm.r$.$fields.nested2.$fields.oneValue).toEqualTypeOf<
        RegleFieldStatus<
          number,
          {
            numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
            required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
            minValue: RegleRuleDefinition<
              number,
              [count: number, options?: CommonComparationOptions | undefined],
              false,
              boolean,
              number
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

    expect(narrowVariant(vm.r$.$fields.nested2.$fields, 'type', 'TWO')).toBe(true);
    expect(vm.invariantRefOne).toBeUndefined();
    expect(vm.invariantRefTwo).toBeDefined();

    if (narrowVariant(vm.r$.$fields.nested2.$fields, 'type', 'TWO') && vm.invariantRefTwo) {
      expect(vm.r$.$fields.nested2.$fields.twoName).toBe(undefined);
      expectTypeOf(vm.r$.$fields.nested2.$fields.twoName).toEqualTypeOf<
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
      expect(vm.r$.$fields.oneName).toBe(undefined);

      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.oneValue).toBe(undefined);

      shouldBeErrorField(vm.r$.$fields.nested2.$fields.twoValue);
      expectTypeOf(vm.r$.$fields.nested2.$fields.twoValue).toEqualTypeOf<
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
});
