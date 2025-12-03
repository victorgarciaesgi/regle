import { useRegleSchema } from '@regle/schemas';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import * as v from 'valibot';
import { reactive } from 'vue';

export function valibotNestedRegleFixture() {
  const form = reactive<StandardSchemaV1.InferInput<typeof schema>>({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
      collection: [{ name: 0, description: '' }],
    },
  });

  const valibotIsEven = v.pipe(
    v.number('This field is required'),
    v.check((value) => {
      return value % 2 === 0;
    }, 'Custom error')
  );

  const schema = v.object({
    level0: v.optional(valibotIsEven),
    level1: v.object({
      child: v.optional(valibotIsEven),
      level2: v.object({
        child: v.optional(valibotIsEven),
      }),
      collection: v.pipe(
        v.array(
          v.object({
            name: valibotIsEven,
            description: v.pipe(v.string(), v.minLength(4, 'This field should be at least 4 characters long')),
          })
        ),
        v.minLength(3, 'Array must contain at least 3 element(s)')
      ),
    }),
  });

  return useRegleSchema(form, schema);
}
