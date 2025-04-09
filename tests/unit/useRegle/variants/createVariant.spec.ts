import { createVariant, discriminateVariant, useRegle } from '@regle/core';
import { literal, numeric, required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';

function createRootVariantRegle() {
  type FormVariant = {
    firstName: string;
  } & (
    | { type: 'ONE'; oneValue: number; oneName: string }
    | { type: 'TWO'; twoValue: number; twoName: string }
    | { type?: undefined }
  );

  const state = ref<FormVariant>({ firstName: '' });

  return useRegle(state, () => {
    const variant = createVariant(state, 'type', [
      { type: { literal: literal('ONE') }, oneValue: { numeric, required } },
      { type: { literal: literal('TWO') }, twoValue: { numeric, required } },
      { type: { required } },
    ]);
    return {
      firstName: { required },
      ...variant.value,
    };
  });
}

function createNestedVariantRegle() {
  type Form = {
    nested2: { name: string } & (
      | { type: 'ONE'; firstName: string }
      | { type: 'TWO'; firstName: number; lastName: string }
      | { type?: undefined }
    );
  };
  const form = ref<Form>({
    nested2: {
      name: '',
    },
  });

  const { r$ } = useRegle(form, () => {
    const variant = createVariant(() => form.value.nested2, 'type', [
      {
        type: { literal: literal('ONE') },
        firstName: { required },
        // details: {
        //   quotes: {
        //     $each: {
        //       name: { required },
        //     },
        //   },
        // },
      },
      { type: { literal: literal('TWO') }, lastName: { required } },
      { type: { required } },
    ]);

    return {
      nested2: {
        name: {},
        ...variant.value,
      },
    };
  });

  // r$.$fields.

  r$.$fields.nested2.$fields.type;

  if (discriminateVariant(r$.$fields.nested2.$fields, 'type', 'TWO')) {
    r$.$fields.nested2.$fields;
  }
}

describe('createVariant', () => {
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

    if (discriminateVariant(vm.r$.$fields, 'type', 'ONE')) {
      // TODO in typings, this could be undefined
      expect(vm.r$.$fields.oneName).toBe(undefined);

      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.twoName).toBe(undefined);
      shouldBeErrorField(vm.r$.$fields.oneValue);
    } else if (discriminateVariant(vm.r$.$fields, 'type', 'TWO')) {
      // TODO in typings, this could be undefined
      expect(vm.r$.$fields.twoName).toBe(undefined);

      // @ts-expect-error property should not be present here
      expect(vm.r$.$fields.oneName).toBe(undefined);
      shouldBeErrorField(vm.r$.$fields.twoValue);
    }
  });
});
