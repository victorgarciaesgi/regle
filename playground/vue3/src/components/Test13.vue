<script setup lang="ts">
  import { inferSchema, useRegleSchema, type RegleSchema } from '@regle/schemas';
  import { computed, ref } from 'vue';
  import { z } from 'zod';

  const entrySchema = z.object({
    foo: z.string().min(5),
    bar: z.string(),
  });

  const formSchema = z.object({
    entry: entrySchema,
    positions: z.array(entrySchema).min(3),
  });

  // Is that the correct way to define the return type of this function?
  function useForm(): RegleSchema<Form> {
    const allFilters = ref({
      positions: [
        {
          foo: 'foo',
          bar: 'bar',
        },
        {
          foo: 'hoo',
          bar: 'lar',
        },
      ],
      entry: {
        foo: 'doo',
        bar: 'war',
      },
    });

    return useRegleSchema(allFilters, formSchema);
  }

  type Entry = z.infer<typeof entrySchema>;
  type Form = z.infer<typeof formSchema>;
</script>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>
