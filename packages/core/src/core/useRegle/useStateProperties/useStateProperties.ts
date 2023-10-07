import { ComputedRef, Ref, reactive, ref, toRef, watch } from 'vue';
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
  const $regle = reactive(createReactiveNestedStatus(scopeRules, state, customRules, ''));

  const errors = useErrors($regle);

  return { $regle, errors };
}
