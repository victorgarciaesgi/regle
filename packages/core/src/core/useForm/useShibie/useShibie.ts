import { ComputedRef, Ref, reactive, ref } from 'vue';
import {
  CustomRulesDeclarationTree,
  ShibieStatus,
  ShibiePartialValidationTree,
} from '../../../types';
import { createReactiveNestedStatus } from './createReactiveStatus';

export function useShibie(
  scopeRules: ComputedRef<ShibiePartialValidationTree<Record<string, any>, any>>,
  state: Ref<Record<string, any>>,
  customRules: () => CustomRulesDeclarationTree
) {
  const $shibie = reactive<
    ShibieStatus<Record<string, any>, ShibiePartialValidationTree<Record<string, any>>>
  >(createReactiveNestedStatus(scopeRules, state, customRules));

  return { $shibie };
}
