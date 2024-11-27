import type { ComputedRef, Ref } from 'vue';
import { computed, reactive, unref } from 'vue';
import type {
  $InternalReglePartialValidationTree,
  CustomRulesDeclarationTree,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { useStorage } from '../../useStorage';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';

export function useStateProperties({
  initialState,
  options,
  scopeRules,
  state,
  customRules,
}: {
  scopeRules: ComputedRef<$InternalReglePartialValidationTree>;
  state: Ref<Record<string, any>>;
  options: ResolvedRegleBehaviourOptions;
  initialState: Record<string, any>;
  customRules?: () => CustomRulesDeclarationTree;
}) {
  const storage = useStorage();

  const externalErrors = computed(() => unref(options.externalErrors));

  const regle = reactive(
    createReactiveNestedStatus({
      rootRules: scopeRules,
      scopeRules,
      state,
      customMessages: customRules?.(),
      storage,
      options,
      externalErrors,
      validationGroups: options.validationGroups,
      initialState,
    })
  );

  return regle;
}
