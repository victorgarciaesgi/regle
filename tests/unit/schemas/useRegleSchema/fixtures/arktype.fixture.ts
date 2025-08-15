import { isFilled } from '@regle/rules';
import { useRegleSchema } from '@regle/schemas';
import { type } from 'arktype';
import { reactive } from 'vue';

export function arktypeNestedRegleFixture() {
  const form = reactive({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
      collection: [{ name: 0 as number | undefined }],
    },
  });

  const arkIsEven = type('number').narrow((data, ctx) => {
    return data % 2 === 0 ? true : ctx.reject({ message: 'Custom error' });
  });

  const schema = type({
    'level0?': arkIsEven,
    level1: type({
      'child?': arkIsEven,
      level2: type({
        'child?': arkIsEven,
      }),
      collection: type({
        name: arkIsEven,
        description: type('string > 4').configure({ message: () => 'This field should be at least 4 characters long' }),
      })
        .array()
        .moreThanLength(3)
        .configure({ message: () => 'Array must contain at least 3 element(s)' }),
    }),
  });

  return useRegleSchema(form, schema);
}
