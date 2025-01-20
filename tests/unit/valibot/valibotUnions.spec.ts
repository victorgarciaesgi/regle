import type { RegleShortcutDefinition } from '@regle/core';
import { reactive } from 'vue';
import * as v from 'valibot';
import { createRegleComponent } from '../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBeUnRuledCorrectField,
  shouldBeValidField,
} from '../../utils/validations.utils';
import { useRegleSchema, type RegleSchemaFieldStatus } from '@regle/schemas';

const GiftType = v.picklist(['Cash', 'Shares'], 'Please select an option');

const CashGift = v.object({
  type: v.literal(GiftType.options[0]),
  amount: v.pipe(v.number(), v.minValue(0), v.finite()),
});

const SharesGift = v.object({
  type: v.literal(GiftType.options[1]),
  shares: v.pipe(
    v.number('Shares must be a number'),
    v.integer(),
    v.minValue(0, 'Must be a positive number'),
    v.finite()
  ),
  company: v.pipe(v.string(), v.nonEmpty("Company can't be empty")),
});

const Dateish = v.pipe(
  v.string(),
  v.transform((x) => {
    return x && typeof x === 'string' ? new Date(x) : x;
  }),
  v.date('Please provide a valid date')
);

const Gift = v.variant('type', [CashGift, SharesGift]);

enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
}

function valibotUnionForm() {
  const schema = v.object({
    enum: v.picklist(['Salmon', 'Tuna', 'Trout']),
    nativeEnum: v.enum(MyEnum),
    union: v.union([v.number(), v.string()]),
    gift: Gift,
    date: Dateish,
  });

  const form = reactive<Partial<v.InferInput<typeof schema>>>({});

  return useRegleSchema(form, schema);
}

describe('valibot unions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should behave correctly with unions, nums, and discriminated unions', async () => {
    const { vm } = createRegleComponent(valibotUnionForm);

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

    shouldBeValidField(vm.r$.$fields.enum);
    shouldBeValidField(vm.r$.$fields.nativeEnum);
    shouldBeValidField(vm.r$.$fields.union);
    shouldBeValidField(vm.r$.$fields.date);
    shouldBeErrorField(vm.r$.$fields.gift);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$value.amount = 100;
    }
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.gift);
    expect(vm.r$.$fields.gift?.$fields.type.$value).toBe('Cash');
    shouldBeValidField(vm.r$.$fields.gift?.$fields.type);
    shouldBeValidField(vm.r$.$fields.gift?.$fields.amount);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$fields.type.$value = 'Shares';
    }
    await vm.$nextTick();

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$value.company = 'Regle';
      vm.r$.$fields.gift.$value.shares = 100;
    }
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.gift);
    expect(vm.r$.$value.gift?.type).toBe('Shares');
    shouldBeValidField(vm.r$.$fields.gift?.$fields.company);
    shouldBeValidField(vm.r$.$fields.gift?.$fields.shares);

    const [{ result }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$fields.type.$value = undefined as any;
    }
    await vm.$nextTick();

    expect(result).toBe(true);

    shouldBeErrorField(vm.r$.$fields.gift);
    shouldBeErrorField(vm.r$.$fields.gift?.$fields.type);
    expect(vm.r$.$value.gift?.type).toBe(undefined);
    shouldBeUnRuledCorrectField(vm.r$.$fields.gift?.$fields.company);
    shouldBeUnRuledCorrectField(vm.r$.$fields.gift?.$fields.shares);
    shouldBeUnRuledCorrectField(vm.r$.$fields.gift?.$fields.amount);

    expectTypeOf(vm.r$.$fields.gift?.$fields.company).toEqualTypeOf<
      RegleSchemaFieldStatus<string, string | undefined, RegleShortcutDefinition<any>> | undefined
    >();
    expectTypeOf(vm.r$.$fields.gift?.$fields.amount).toEqualTypeOf<
      RegleSchemaFieldStatus<number, number | undefined, RegleShortcutDefinition<any>> | undefined
    >();
    expectTypeOf(vm.r$.$fields.gift?.$fields.shares).toEqualTypeOf<
      RegleSchemaFieldStatus<number, number | undefined, RegleShortcutDefinition<any>> | undefined
    >();

    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.enum = 'Not valid';
    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.nativeEnum = 'Not valid';
    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.union = false;
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.enum);
    shouldBeErrorField(vm.r$.$fields.nativeEnum);
    shouldBeErrorField(vm.r$.$fields.union);
  });
});
