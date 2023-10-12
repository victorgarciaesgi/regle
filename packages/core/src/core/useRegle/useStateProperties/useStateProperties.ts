import { ComputedRef, Ref, reactive } from 'vue';
import { $InternalReglePartialValidationTree, CustomRulesDeclarationTree } from '../../../types';
import { useErrors } from '../useErrors';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';

export function useStateProperties(
  scopeRules: ComputedRef<$InternalReglePartialValidationTree>,
  state: Ref<Record<string, any>>,
  customRules: () => CustomRulesDeclarationTree
) {
  const $regle = reactive(
    createReactiveNestedStatus({
      rootRules: scopeRules,
      scopeRules,
      state,
      customMessages: customRules(),
    })
  );

  const errors = useErrors($regle);

  return { $regle, errors };
}
