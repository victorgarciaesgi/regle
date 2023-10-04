import { ComputedRef, Ref, reactive, ref } from 'vue';
import {
  CustomRulesDeclarationTree,
  RegleStatus,
  ReglePartialValidationTree,
} from '../../../types';
import { createReactiveNestedStatus } from './createReactiveStatus';

export function useRegle(
  scopeRules: ComputedRef<ReglePartialValidationTree<Record<string, any>, any>>,
  state: Ref<Record<string, any>>,
  customRules: () => CustomRulesDeclarationTree
) {
  const $regle = createReactiveNestedStatus(scopeRules, state, customRules);

  return { $regle };
}
