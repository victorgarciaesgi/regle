import { defineRegleSchemaConfig } from '@regle/schemas';
import * as v from 'valibot';
import { ref } from 'vue';

export function valibotGlobalConfigFixture() {
  const { useRegleSchema } = defineRegleSchemaConfig({});

  const condition = ref(true);
  const form = ref({
    level0: '',
    level1: {
      level2: {
        child: '',
      },
    },
    collection: [{ name: '' }],
  });

  return {
    condition,
    ...useRegleSchema(
      form,
      v.object({
        level0: v.pipe(v.string(), v.nonEmpty()),
        level1: v.object({
          level2: v.object({
            child: v.pipe(v.string(), v.nonEmpty()),
          }),
        }),
        collection: v.array(
          v.object({
            name: v.pipe(v.string(), v.nonEmpty()),
          })
        ),
      })
    ),
  };
}
