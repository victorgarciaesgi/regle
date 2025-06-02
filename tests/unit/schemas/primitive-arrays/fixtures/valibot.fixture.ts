import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';

export function valibotfixture() {
  const tagSchema = v.array(v.picklist(['wolt', 'eat_in'], 'Custom message'));
  const menuSchema = v.object({
    tags: tagSchema,
  });

  return useRegleSchema({ tags: [] }, menuSchema);
}
