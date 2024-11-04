import type { ComputedRef, Ref } from 'vue';
import { computed, reactive, unref } from 'vue';
import type {
  $InternalReglePartialValidationTree,
  CustomRulesDeclarationTree,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { useStorage } from '../../useStorage';
import { useErrors } from '../useErrors';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';

export function useStateProperties(
  scopeRules: ComputedRef<$InternalReglePartialValidationTree>,
  state: Ref<Record<string, any>>,
  options: ResolvedRegleBehaviourOptions,
  customRules?: () => CustomRulesDeclarationTree
) {
  const storage = useStorage();

  const externalErrors = computed(() => unref(options.$externalErrors));

  const regle = reactive(
    createReactiveNestedStatus({
      rootRules: scopeRules,
      scopeRules,
      state,
      customMessages: customRules?.(),
      storage,
      options,
      externalErrors,
    })
  );

  const errors = useErrors(regle);

  return { regle, errors };
}
