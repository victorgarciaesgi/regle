<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { required } from '@regle/rules';
  import { useRegle, type RegleRoot } from '@regle/core';

  const isFormValid = ref(false);

  interface MyForm {
    firstName: string;
    lastName: string;
    someThings: { uuid: string }[];
  }

  const useFormMyForm = () => {
    const myFormRules = computed(() => {
      return {
        firstName: { required },
        lastName: { required },
      };
    });

    const { r$: myForm } = useRegle(
      {
        firstName: '',
        lastName: '',
        someThings: [],
      } as MyForm,
      myFormRules,
      {}
    );

    return {
      myForm,
    };
  };

  const useMyFormSave = (myForm: RegleRoot<MyForm>) => {
    const save = async () => {
      isFormValid.value = false;

      const { valid } = await myForm.$validate();

      if (valid) {
        isFormValid.value = true;
      }
    };

    return {
      save,
    };
  };

  const { myForm } = useFormMyForm();
  // Regression check for https://github.com/victorgarciaesgi/regle/issues/378
  const { save } = useMyFormSave(myForm);
</script>
