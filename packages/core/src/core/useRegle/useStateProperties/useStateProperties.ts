import type { ComputedRef, Ref } from 'vue';
import { computed, reactive, unref } from 'vue';
import type {
  $InternalReglePartialRuleTree,
  CustomRulesDeclarationTree,
  RegleShortcutDefinition,
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
  shortcuts,
}: {
  scopeRules: ComputedRef<$InternalReglePartialRuleTree>;
  state: Ref<Record<string, any>>;
  options: ResolvedRegleBehaviourOptions;
  initialState: Record<string, any>;
  customRules?: () => CustomRulesDeclarationTree;
  shortcuts: RegleShortcutDefinition | undefined;
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
      shortcuts,
      fieldName: 'root',
    })
  );

  return regle;
}
