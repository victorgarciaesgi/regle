import { defineRegleSchemaConfig } from '@regle/schemas';
import { ref } from 'vue';
import z from 'zod';

export function zodGlobalConfigFixture() {
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
      z.object({
        level0: z.string().nonempty(),
        level1: z.object({
          level2: z.object({
            child: z.string().nonempty(),
          }),
        }),
        collection: z.array(
          z.object({
            name: z.string().nonempty(),
          })
        ),
      })
    ),
  };
}
