import type { RegleShortcutDefinition } from '@regle/core';
import { reactive } from 'vue';
import { z } from 'zod';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBeUnRuledCorrectField,
  shouldBeUnRuledSchemaCorrectField,
  shouldBeValidField,
} from '../../../utils/validations.utils';
import { useRegleSchema, type RegleSchemaFieldStatus } from '@regle/schemas';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../../packages/core/src/utils';

const GiftType = z.enum(['Cash', 'Shares'], {
  required_error: 'Please select an option',
});

const CashGift = z.object({
  type: z.literal(GiftType.Values.Cash),
  amount: z.number().nonnegative().finite(),
});

const SharesGift = z.object({
  type: z.literal(GiftType.Values.Shares),
  shares: z
    .number({
      invalid_type_error: 'Shares must be a number',
    })
    .int()
    .nonnegative('Must be a positive number')
    .finite(),
  company: z
    .string({
      required_error: "Company can't be empty",
    })
    .nonempty("Company can't be empty"),
});

const Dateish = z.preprocess(
  (x) => {
    return x && typeof x === 'string' ? new Date(x) : x;
  },
  z.date({
    required_error: 'Please provide a valid date',
    invalid_type_error: 'Please provide a valid date',
  })
);

const Gift = z.discriminatedUnion('type', [CashGift, SharesGift], { description: 'Gift' });

enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
}

function zodUnionForm() {
  const schema = z.object({
    enum: z.enum(['Salmon', 'Tuna', 'Trout']),
    nativeEnum: z.nativeEnum(MyEnum),
    union: z.union([z.number(), z.string()]),
    gift: Gift,
    date: Dateish,
  });

  const form = reactive<Partial<z.input<typeof schema>>>({
    gift: {} as any,
  });

  return useRegleSchema(form, schema, { mode: 'schema' });
}

describe('zod - unions types', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should behave correctly with unions, nums, and discriminated unions', async () => {
    const { vm } = createRegleComponent(zodUnionForm);

    shouldBeInvalidField(vm.r$.$fields.enum);
    shouldBeInvalidField(vm.r$.$fields.nativeEnum);
    shouldBeInvalidField(vm.r$.$fields.union);
    shouldBeInvalidField(vm.r$.$fields.gift);
    shouldBeInvalidField(vm.r$.$fields.date);

    vm.r$.$value.enum = 'Salmon';
    vm.r$.$value.nativeEnum = MyEnum.Foo;
    vm.r$.$value.union = 6;
    vm.r$.$value.date = '1995-01-08';

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$fields.type.$value = 'Cash';
    }
    await vm.$nextTick();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.enum);
    shouldBeValidField(vm.r$.$fields.nativeEnum);
    shouldBeValidField(vm.r$.$fields.union);
    shouldBeValidField(vm.r$.$fields.date);
    shouldBeErrorField(vm.r$.$fields.gift);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$value.amount = 100;
    }
    await vm.$nextTick();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.gift);
    expect(vm.r$.$fields.gift?.$fields.type.$value).toBe('Cash');
    shouldBeValidField(vm.r$.$fields.gift?.$fields.type);
    shouldBeValidField(vm.r$.$fields.gift?.$fields.amount);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$fields.type.$value = 'Shares';
    }
    await vm.$nextTick();
    await vm.$nextTick();

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$value.company = 'Regle';
      vm.r$.$fields.gift.$value.shares = 100;
    }
    await vm.$nextTick();
    await vm.$nextTick();

    if (isVueSuperiorOrEqualTo3dotFive) {
      shouldBeValidField(vm.r$.$fields.gift);
      expect(vm.r$.$value.gift?.type).toBe('Shares');
      shouldBeValidField(vm.r$.$fields.gift?.$fields.company);
      shouldBeValidField(vm.r$.$fields.gift?.$fields.shares);
    }

    const [{ result }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$fields.type.$value = undefined as any;
    }
    await vm.$nextTick();
    await vm.$nextTick();

    expect(result).toBe(true);

    shouldBeErrorField(vm.r$.$fields.gift);
    shouldBeErrorField(vm.r$.$fields.gift?.$fields.type);
    expect(vm.r$.$value.gift?.type).toBe(undefined);

    // Can't remove the "valid" as we cannot know if the field is supposed to have a validation
    shouldBeUnRuledSchemaCorrectField(vm.r$.$fields.gift?.$fields.company);
    shouldBeUnRuledSchemaCorrectField(vm.r$.$fields.gift?.$fields.shares);
    shouldBeUnRuledSchemaCorrectField(vm.r$.$fields.gift?.$fields.amount);

    expectTypeOf(vm.r$.$fields.gift?.$fields.company).toEqualTypeOf<
      RegleSchemaFieldStatus<string, string | undefined, 'schema', RegleShortcutDefinition<any>> | undefined
    >();
    expectTypeOf(vm.r$.$fields.gift?.$fields.amount).toEqualTypeOf<
      RegleSchemaFieldStatus<number, number | undefined, 'schema', RegleShortcutDefinition<any>> | undefined
    >();

    expectTypeOf(vm.r$.$fields.date).toEqualTypeOf<
      RegleSchemaFieldStatus<unknown, unknown, 'schema', RegleShortcutDefinition<any>> | undefined
    >();

    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.enum = 'Not valid';
    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.nativeEnum = 'Not valid';
    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.union = false;

    await vm.$nextTick();

    if (isVueSuperiorOrEqualTo3dotFive) {
      shouldBeErrorField(vm.r$.$fields.enum);
      shouldBeErrorField(vm.r$.$fields.nativeEnum);
      shouldBeErrorField(vm.r$.$fields.union);
    }
  });
});
