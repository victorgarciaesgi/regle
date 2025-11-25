import { required, minLength, email } from '@regle/rules';
import { defineStore, skipHydrate } from 'pinia';
import { useRegle } from '@regle/core';

export const useDemoStore = defineStore('demo-store', () => {
  const { r$ } = useRegle(
    { email: '' },
    {
      email: { required, minLength: minLength(4), email },
    }
  );

  return {
    r$: skipHydrate(r$),
  };
});
