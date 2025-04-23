import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod4';

export function zod4SingleFieldFixture() {
  const name = ref<number | undefined>();
  return useRegleSchema(name, z.number());
}
