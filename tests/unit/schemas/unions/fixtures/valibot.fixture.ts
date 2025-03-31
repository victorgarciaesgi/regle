import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';
import { reactive } from 'vue';

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
  v.unknown(),
  v.transform((x) => {
    return x && typeof x === 'string' ? new Date(x) : x;
  }),
  v.date('Please provide a valid date')
);

const Gift = v.variant('type', [CashGift, SharesGift]);

export const MyEnum = {
  Foo: 'Foo',
  Bar: 'Bar',
} as const;

export function valibotUnionsFixture() {
  const schema = v.object({
    enum: v.picklist(['Salmon', 'Tuna', 'Trout']),
    nativeEnum: v.enum(MyEnum),
    union: v.union([v.number(), v.string()]),
    gift: Gift,
    date: Dateish,
  });

  const form = reactive<Partial<v.InferInput<typeof schema>>>({
    gift: {} as any,
  });

  return useRegleSchema(form, schema);
}
