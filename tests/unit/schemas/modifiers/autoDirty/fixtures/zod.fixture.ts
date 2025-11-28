import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod/v4';

export function zodAutoDirtyLocalFixture() {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ name: '' }],
  });

  const schema = z.object({
    email: z.email(),
    user: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
    }),
    contacts: z.array(
      z.object({
        name: z.string().min(1),
      })
    ),
  });

  return useRegleSchema(form, schema, { autoDirty: false });
}
