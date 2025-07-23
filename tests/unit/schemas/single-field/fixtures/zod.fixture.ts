import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod/v3';

export function zodSingleFieldFixture() {
  const name = ref<number | undefined>();
  return useRegleSchema(name, z.number());
}
