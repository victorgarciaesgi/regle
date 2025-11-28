import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod/v3';

export function zodRewardEarlyFixture() {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ name: '' }],
  });

  const schema = z.object({
    email: z.string().email(),
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

  return useRegleSchema(form, schema, { rewardEarly: true });
}
