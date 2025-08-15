import { isFilled } from '@regle/rules';
import { useRegleSchema } from '@regle/schemas';
import { reactive } from 'vue';
import { z } from 'zod/v3';

export function zodNestedRegleFixture() {
  const zodIsEven = z
    .number({
      required_error: 'This field is required',
      invalid_type_error: 'This field is required',
    })
    .refine(
      (value) => {
        if (isFilled(value)) {
          return value % 2 === 0;
        }
        return true;
      },
      { message: 'Custom error' }
    );

  const schema = z.object({
    level0: zodIsEven.optional(),
    level1: z.object({
      child: zodIsEven.optional(),
      level2: z.object({
        child: zodIsEven.optional(),
      }),
      collection: z
        .array(
          z.object({
            name: zodIsEven,
            description: z.string().min(4, { message: 'This field should be at least 4 characters long' }),
          })
        )
        .min(3, { message: 'Array must contain at least 3 element(s)' }),
    }),
  });

  const form = reactive<z.infer<typeof schema>>({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
      collection: [{ name: 0, description: '' }],
    },
  });

  return useRegleSchema(form, schema);
}
