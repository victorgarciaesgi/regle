import { isFilled } from '@regle/rules';
import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod/v4';
import { timeout } from '../../../../utils';

export function zod4AsyncSchemaFixture() {
  const form = {
    level0Async: ref(0),
    level1: {
      child: ref(1),
      level2: {
        childAsync: ref(''),
      },
    },
  };

  const ruleMockIsEvenAsync = z.number().refine(
    async (value) => {
      if (isFilled(value)) {
        await timeout(1000);
        return value % 2 === 0;
      }
      return true;
    },
    { message: 'Custom error' }
  );

  const ruleMockIsFooAsync = z.string().refine(
    async (value) => {
      if (isFilled(value)) {
        await timeout(1000);
        return value === 'foo';
      }
      return true;
    },
    { message: 'Custom error' }
  );

  const zodIsEven = z
    .number({
      error: 'This field is required',
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

  return useRegleSchema(
    form,
    z.object({
      level0Async: ruleMockIsEvenAsync,
      level1: z.object({
        child: zodIsEven,
        level2: z.object({
          childAsync: ruleMockIsFooAsync,
        }),
      }),
    })
  );
}
