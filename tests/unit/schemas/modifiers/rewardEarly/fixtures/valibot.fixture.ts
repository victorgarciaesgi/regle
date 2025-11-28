import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';
import { ref } from 'vue';

export function valibotRewardEarlyFixture() {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ name: '' }],
  });

  const schema = v.object({
    email: v.pipe(v.string(), v.email()),
    user: v.object({
      firstName: v.pipe(v.string(), v.minLength(1)),
      lastName: v.pipe(v.string(), v.minLength(1)),
    }),
    contacts: v.array(
      v.object({
        name: v.pipe(v.string(), v.minLength(1)),
      })
    ),
  });

  return useRegleSchema(form, schema, { rewardEarly: true });
}
