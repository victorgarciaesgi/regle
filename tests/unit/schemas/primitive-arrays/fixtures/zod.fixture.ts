import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod/v4';

export function zodFixture() {
  const tagSchema = z.array(z.enum(['wolt', 'eat_in'], 'Custom message'));
  const menuSchema = z.object({
    tags: tagSchema,
    usernames: z.array(z.string()).min(1, 'Custom message'),
  });

  return useRegleSchema({ tags: [], usernames: [] }, menuSchema);
}
