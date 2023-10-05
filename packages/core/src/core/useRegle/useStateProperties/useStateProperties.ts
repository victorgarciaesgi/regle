import { ComputedRef, Ref, reactive, ref, toRef } from 'vue';
import {
  CustomRulesDeclarationTree,
  RegleStatus,
  ReglePartialValidationTree,
} from '../../../types';
import { createReactiveNestedStatus } from './createReactiveStatus';
import { useErrors } from '../useErrors';

export function useStateProperties(
  scopeRules: ComputedRef<ReglePartialValidationTree<Record<string, any>, any>>,
  state: Ref<Record<string, any>>,
  customRules: () => CustomRulesDeclarationTree
) {
  const $regle = ref(createReactiveNestedStatus(scopeRules, state, customRules));

  const errors = useErrors($regle);

  return { $regle, errors };
}
