import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod';

export function zodSingleFieldFixture() {
  const name = ref<number | undefined>();
  return useRegleSchema(name, z.number());
}
