import { useRegleSchema } from '@regle/schemas';
import { type } from 'arktype';
import { ref } from 'vue';

export function arktypeAutoDirtyLocalFixture() {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ name: '' }],
  });

  const schema = type({
    email: 'string.email',
    user: type({
      firstName: 'string>0',
      lastName: 'string>0',
    }),
    contacts: type({
      name: 'string>0',
    }).array(),
  });

  return useRegleSchema(form, schema, { autoDirty: false });
}
