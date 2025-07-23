import { useRegleSchema } from '@regle/schemas';
import { reactive } from 'vue';
import { z } from 'zod/v3';

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

export const MyEnum = {
  Foo: 'Foo',
  Bar: 'Bar',
} as const;

export function zodUnionsFixture() {
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

  return useRegleSchema(form, schema);
}
