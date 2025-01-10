import { reactive } from 'vue';
import { z } from 'zod';
import { useZodRegle } from '@regle/zod';

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
const Gift = z.discriminatedUnion('type', [CashGift, SharesGift], { description: 'Gift' });

enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
}

describe('zod unions', () => {
  function zodUnionForm() {
    type Form = {
      enum?: 'Salmon' | 'Tuna' | 'Trout';
      nativeEnum?: MyEnum;
      gift?: z.infer<typeof Gift>;
      union?: string | number;
    };

    const form = reactive<Form>({});

    return useZodRegle(
      form,
      z.object({
        enum: z.enum(['Salmon', 'Tuna', 'Trout']),
        nativeEnum: z.nativeEnum(MyEnum),
        union: z.union([z.number(), z.string()]),
      })
    );
  }
  it('true', () => {
    expect(true).toBe(true);
  });
});
