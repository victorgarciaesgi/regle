import { useRegleSchema, withDeps } from '@regle/schemas';
import { computed, reactive } from 'vue';
import { z } from 'zod';

function zodWithDepsFixture() {
  const form = reactive({
    field1: '',
    nested: {
      field2: '',
    },
  });

  const schema = computed(() => {
    return z.object({
      field1: z.string(),
      nested: z.object({
        field2: withDeps(
          z.string().refine((v) => v !== form.field1),
          [() => form.field1]
        ),
      }),
    });
  });

  return useRegleSchema(form, schema);
}
