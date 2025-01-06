import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { defineStore, skipHydrate } from 'pinia';

function useForm() {
  const { r$ } = useRegle({ name: '' }, { name: { required: required } });
  return r$;
}

export const useTestStore = defineStore('test-store', () => {
  const r$ = useForm();
  return { r$: skipHydrate(r$) };
});
