import { useRegle } from '#imports';
import { required } from '@regle/rules';
import { defineStore } from 'pinia';

export const useTestStore = defineStore('test', () => {
  const { r$ } = useRegle({ name: 'coucou' }, { name: { required: required } });
  return { r$ };
});
