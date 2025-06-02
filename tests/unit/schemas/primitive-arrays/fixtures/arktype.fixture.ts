import { useRegleSchema } from '@regle/schemas';
import { type } from 'arktype';

export function arktypefixture() {
  const tagSchema = type("'wolt' |'eat_in'").configure({
    message: () => {
      return 'Custom message';
    },
  });
  const menuSchema = type({
    tags: type(tagSchema, '[]'),
  });

  return useRegleSchema({ tags: [] }, menuSchema);
}
