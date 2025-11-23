import { type RegleExternalErrorTree } from '@regle/core';
import { and, applyIf, minLength, minValue, numeric, required, sameAs, withMessage } from '@regle/rules';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useCustomRegle } from '../validations/regle.global.config';
import { checkPseudo } from '../validations/custom-rules/check-pseudo.rule';
import { strongPassword } from '../validations/custom-rules/strong-password.rule';

export interface Form {
  user: {
    pseudo?: string;
    password?: string;
    confirmPassword?: string;
  };
  additionalInfos?: string;
  projects: Array<{ name: string; countMaintainers?: number; maintainers: { name: string }[] }>;
}

export const useMyForm = defineStore('my-form', () => {
  const externalErrors = ref<RegleExternalErrorTree<Form>>({});

  const form = ref<Form>({ user: {}, projects: [{ name: '', maintainers: [] }] });

  const { r$ } = useCustomRegle(
    form,
    {
      user: {
        /** checkPseudo is an async validator */
        pseudo: { required, checkPseudo },
        password: { required, strongPassword: strongPassword() },
        confirmPassword: {
          required,
          sameAs: withMessage(
            sameAs(() => form.value.user.password),
            "Your passwords don't match"
          ),
        },
      },
      projects: {
        required: withMessage(and(required, minLength(1)), ({ $params: [min] }) => `You need at least ${min} projects`),
        $autoDirty: false,
        $rewardEarly: true,
        $each: (project) => ({
          name: { required },
          countMaintainers: { numeric, minValue: minValue(1) },
          maintainers: {
            $autoDirty: false,
            $rewardEarly: true,
            minLength: applyIf(
              () => !!project.value.countMaintainers,
              withMessage(and(required, minLength(1)), ({ $params: [min] }) => `You need at least ${min} maintainers`)
            ),
            $each: {
              name: { required },
            },
          },
        }),
      },
    },
    {
      externalErrors,
    }
  );

  return {
    r$,
  };
});
