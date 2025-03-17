import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import * as v from 'valibot';

export function valibotSingleFieldFixture() {
  const name = ref<number | undefined>();
  return useRegleSchema(name, v.number());
}
