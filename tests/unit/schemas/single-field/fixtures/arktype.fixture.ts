import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { type } from 'arktype';

export function arkTypeSingleFieldFixture() {
  const name = ref<number | undefined>();
  return useRegleSchema(name, type('number'));
}
