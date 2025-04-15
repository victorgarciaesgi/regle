import { useRegleSchema } from '@regle/schemas';
import { reactive } from 'vue';
import { z } from 'zod4';

const GiftType = z.enum(['Cash', 'Shares'], {
  error: 'Please select an option',
});

const CashGift = z.object({
  type: z.literal(GiftType.enum.Cash),
  amount: z.number().nonnegative().finite(),
});

const SharesGift = z.object({
  type: z.literal(GiftType.enum.Shares),
  shares: z.int({
    error: 'Shares must be a number',
  }),
  company: z
    .string({
      error: "Company can't be empty",
    })
    .nonempty("Company can't be empty"),
});

const Dateish = z.preprocess(
  (x) => {
    return x && typeof x === 'string' ? new Date(x) : x;
  },
  z.date({
    error: 'Please provide a valid date',
  })
);

const Gift = z.discriminatedUnion('type', [CashGift, SharesGift]).meta({ description: 'Gift' });

export const MyEnum = {
  Foo: 'Foo',
  Bar: 'Bar',
} as const;

export function zod4UnionsFixture() {
  const schema = z.object({
    enum: z.enum(['Salmon', 'Tuna', 'Trout']),
    nativeEnum: z.enum(MyEnum),
    union: z.union([z.number(), z.string()]),
    gift: Gift,
    date: Dateish,
  });

  const form = reactive<Partial<z.input<typeof schema>>>({
    gift: {} as any,
  });

  return useRegleSchema(form, schema);
}
