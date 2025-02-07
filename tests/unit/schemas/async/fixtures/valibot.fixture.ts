import { isFilled } from '@regle/rules';
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';
import { ref } from 'vue';
import { timeout } from '../../../../utils';

export function valibotAsyncSchemaFixture() {
  const form = {
    level0Async: ref(0),
    level1: {
      child: ref(1),
      level2: {
        childAsync: ref(''),
      },
    },
  };

  const ruleMockIsEvenAsync = v.pipeAsync(
    v.number(),
    v.checkAsync(async (value) => {
      if (isFilled(value)) {
        await timeout(1000);
        return value % 2 === 0;
      }
      return true;
    }, 'Custom error')
  );

  const ruleMockIsFooAsync = v.pipeAsync(
    v.string(),
    v.checkAsync(async (value) => {
      if (isFilled(value)) {
        await timeout(1000);
        return value === 'foo';
      }
      return true;
    }, 'Custom error')
  );

  const valibotIsEven = v.pipe(
    v.number('This field is required'),
    v.check((value) => {
      if (isFilled(value)) {
        return value % 2 === 0;
      }
      return true;
    }, 'Custom error')
  );

  const schema = v.objectAsync({
    level0Async: ruleMockIsEvenAsync,
    level1: v.objectAsync({
      child: valibotIsEven,
      level2: v.objectAsync({
        childAsync: ruleMockIsFooAsync,
      }),
    }),
  });

  return useRegleSchema(form, schema);
}
