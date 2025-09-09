import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';

export function valibotfixture() {
  const tagSchema = v.array(v.picklist(['wolt', 'eat_in'], 'Custom message'));
  const menuSchema = v.object({
    tags: tagSchema,
    usernames: v.pipe(v.array(v.string()), v.minLength(1, 'Custom message')),
  });

  return useRegleSchema({ tags: [], usernames: [] }, menuSchema);
}
