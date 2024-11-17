import { required, minLength, email } from '@regle/rules';
import { defineStore } from 'pinia';
import { useRegle } from '@regle/core';

export const useDemoStore = defineStore('demo-store', () => {
  const regleProperties = useRegle(
    { email: '' },
    {
      email: { required, minLength: minLength(4), email },
    }
  );

  return {
    ...regleProperties,
  };
});
