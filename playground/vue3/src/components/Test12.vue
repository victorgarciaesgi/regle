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

  /* Workaround:
  const useMyFormSave = (myForm: ReturnType<typeof useFormMyForm>['myForm']) => {
*/
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
  /*
Error:
Argument of type 'Raw<RegleRoot<{ firstName: string; lastName: string; someThings: { uuid: string; }[]; }, { firstName: { required: RegleRuleDefinition<"required", unknown, [], false, boolean, unknown, unknown, true>; }; lastName: { ...; }; }, Record<...>, RegleShortcutDefinition<...>>>' is not assignable to parameter of type 'RegleRoot<MyForm>'.
  Type 'Raw<RegleRoot<{ firstName: string; lastName: string; someThings: { uuid: string; }[]; }, { firstName: { required: RegleRuleDefinition<"required", unknown, [], false, boolean, unknown, unknown, true>; }; lastName: { ...; }; }, Record<...>, RegleShortcutDefinition<...>>>' is not assignable to type '{ readonly $fields: {} & { readonly firstName: RegleFieldStatus<string, any, {}>; readonly lastName: RegleFieldStatus<string, any, {}>; readonly someThings: RegleCollectionStatus<...> | ... 1 more ... | RegleCollectionStatus<...>; }; ... 7 more ...; $validate: (forceValues?: { ...; } | undefined) => Promise<...>; }'.
    The types returned by '$validate(...)' are incompatible between these types.
      Type 'Promise<RegleResult<{ firstName: string; lastName: string; someThings: { uuid: string; }[]; }, { firstName: { required: RegleRuleDefinition<"required", unknown, [], false, boolean, unknown, unknown, true>; }; lastName: { ...; }; }>>' is not assignable to type 'Promise<RegleResult<{ firstName: string; lastName: string; someThings: { uuid: string; }[]; }, Record<string, any>>>'.
        Type 'RegleResult<{ firstName: string; lastName: string; someThings: { uuid: string; }[]; }, { firstName: { required: RegleRuleDefinition<"required", unknown, [], false, boolean, unknown, unknown, true>; }; lastName: { ...; }; }>' is not assignable to type 'RegleResult<{ firstName: string; lastName: string; someThings: { uuid: string; }[]; }, Record<string, any>>'.
          Type '{ valid: true; data: { someThings?: MaybeOutput<{ uuid: string; }[]>; firstName: string; lastName: string; }; issues: EmptyObject; errors: EmptyObject; }' is not assignable to type 'RegleResult<{ firstName: string; lastName: string; someThings: { uuid: string; }[]; }, Record<string, any>>'.
            Type '{ valid: true; data: { someThings?: MaybeOutput<{ uuid: string; }[]>; firstName: string; lastName: string; }; issues: EmptyObject; errors: EmptyObject; }' is not assignable to type '{ valid: true; data: { firstName?: MaybeOutput<string>; lastName?: MaybeOutput<string>; someThings: { uuid?: MaybeOutput<string>; }[]; }; issues: EmptyObject; errors: EmptyObject; }'.
              The types of 'data.someThings' are incompatible between these types.
                Type 'MaybeOutput<{ uuid: string; }[]>' is not assignable to type '{ uuid?: MaybeOutput<string>; }[]'.
                  Type 'undefined' is not assignable to type '{ uuid?: MaybeOutput<string>; }[]'.
*/
  const { save } = useMyFormSave(myForm);
</script>
