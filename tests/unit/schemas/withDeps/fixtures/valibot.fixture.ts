import { useRegleSchema, withDeps } from '@regle/schemas';
import * as v from 'valibot';
import { computed, reactive } from 'vue';

export function valibotWithDepsFixture() {
  const form = reactive({
    field1: '',
    nested: {
      field2: '',
    },
  });

  const schema = computed(() => {
    return v.object({
      field1: v.string(),
      nested: v.object({
        field2: withDeps(
          v.pipe(
            v.string(),
            v.check((v) => v !== form.field1)
          ),
          [() => form.field1]
        ),
      }),
    });
  });

  return useRegleSchema(form, schema);
}
