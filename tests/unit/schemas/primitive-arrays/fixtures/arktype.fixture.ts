import { useRegleSchema } from '@regle/schemas';
import { type } from 'arktype';

export function arktypefixture() {
  const tagSchema = type("'wolt' |'eat_in'").configure({
    message: () => 'Custom message',
  });
  const menuSchema = type({
    tags: type(tagSchema, '[]'),
    usernames: type('string[] >= 1').configure({ message: () => 'Array too short' }),
  });

  return useRegleSchema({ tags: [], usernames: [] }, menuSchema);
}
