import type { ComputedRef, Ref } from 'vue';
import { getCurrentInstance, getCurrentScope, onScopeDispose, reactive, ref } from 'vue';
import type {
  $InternalReglePartialRuleTree,
  $InternalRegleStatus,
  CustomRulesDeclarationTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { useStorage } from '../../useStorage';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';
import { getActivePinia } from 'pinia';

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

  const regle = ref<$InternalRegleStatus>();

  regle.value = createReactiveNestedStatus({
    rootRules: scopeRules,
    rulesDef: scopeRules,
    state,
    customMessages: customRules?.(),
    storage,
    options,
    externalErrors: options.externalErrors as any,
    validationGroups: options.validationGroups,
    initialState,
    shortcuts,
    fieldName: 'root',
    path: '',
  });

  onScopeDispose(() => {
    regle.value?.$unwatch();
  });

  return reactive({ regle });
}
