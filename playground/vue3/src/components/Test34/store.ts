import { defineStore, skipHydrate } from 'pinia';
import { useRegle, type Regle } from '@regle/core';
import { ref } from 'vue';

export const useStore = defineStore('validation', () => {
  const validations = ref<{ name: string; regle: Regle<any, any> }[]>([]);

  function findValidation() {
    return validations.value.find((validation) => validation.name === 'example')?.regle;
  }

  function useForm(formData: Record<string, any>, rules: Record<string, any>) {
    // See if validation already exists, if not create it
    if (!findValidation()) validations.value.push(skipHydrate({ name: 'example', regle: useRegle(formData, rules) }));
    return findValidation();
  }

  return {
    findValidation,
    useForm,
    validations,
  };
});
