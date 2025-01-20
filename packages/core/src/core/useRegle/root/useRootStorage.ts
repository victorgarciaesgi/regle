import type { ComputedRef, Ref } from 'vue';
import { getCurrentScope, onScopeDispose, reactive, ref } from 'vue';
import type {
  $InternalRegleErrorTree,
  $InternalReglePartialRuleTree,
  $InternalRegleStatus,
  CustomRulesDeclarationTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { useStorage } from '../../useStorage';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';

export function useRootStorage({
  initialState,
  options,
  scopeRules,
  state,
  customRules,
  shortcuts,
  schemaErrors,
  schemaMode = false,
}: {
  scopeRules: Ref<$InternalReglePartialRuleTree>;
  state: Ref<Record<string, any>>;
  options: ResolvedRegleBehaviourOptions;
  initialState: Ref<Record<string, any>>;
  customRules?: () => CustomRulesDeclarationTree;
  shortcuts: RegleShortcutDefinition | undefined;
  schemaErrors?: Ref<Partial<$InternalRegleErrorTree> | undefined>;
  schemaMode?: boolean;
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
    schemaErrors,
    rootSchemaErrors: schemaErrors,
    schemaMode,
  });

  if (getCurrentScope()) {
    onScopeDispose(() => {
      regle.value?.$unwatch();
    });
  }

  return reactive({ regle });
}
