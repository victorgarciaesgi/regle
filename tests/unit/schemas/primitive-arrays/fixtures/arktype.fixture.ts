import { useRegleSchema } from '@regle/schemas';
import { type } from 'arktype';

export function arktypefixture() {
  const tagSchema = type("'wolt' |'eat_in'").configure({
    message: () => 'Custom message',
  });
  const menuSchema = type({
    tags: type(tagSchema, '[]'),
    usernames: type('string[] > 0').configure({ message: () => 'Custom message' }),
  });

  return useRegleSchema({ tags: [], usernames: [] }, menuSchema);
}
