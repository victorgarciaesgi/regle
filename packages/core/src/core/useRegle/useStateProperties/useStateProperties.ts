import { ComputedRef, Ref, reactive } from 'vue';
import {
  $InternalReglePartialValidationTree,
  CustomRulesDeclarationTree,
  DeepMaybeRef,
  RegleBehaviourOptions,
} from '../../../types';
import { useErrors } from '../useErrors';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';
import { useStorage } from '../../useStorage';
import { RequiredDeep } from 'type-fest';

export function useStateProperties(
  scopeRules: ComputedRef<$InternalReglePartialValidationTree>,
  state: Ref<Record<string, any>>,
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>,
  customRules?: () => CustomRulesDeclarationTree
) {
  const storage = useStorage();

  const $regle = reactive(
    createReactiveNestedStatus({
      rootRules: scopeRules,
      scopeRules,
      state,
      customMessages: customRules?.(),
      storage,
      options,
    })
  );

  const errors = useErrors($regle);

  return { $regle, errors };
}
