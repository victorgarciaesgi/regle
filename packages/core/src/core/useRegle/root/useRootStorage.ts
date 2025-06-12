import type { Ref } from 'vue';
import { getCurrentScope, onScopeDispose, reactive, ref } from 'vue';
import type {
  $InternalRegleErrorTree,
  $InternalReglePartialRuleTree,
  $InternalRegleResult,
  $InternalRegleShortcutDefinition,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  PrimitiveTypes,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { useStorage } from '../../useStorage';
import { isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
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
  onValidate,
}: {
  scopeRules: Ref<$InternalReglePartialRuleTree>;
  state: Ref<Record<string, any> | PrimitiveTypes>;
  options: ResolvedRegleBehaviourOptions;
  initialState: Ref<Record<string, any> | PrimitiveTypes>;
  customRules?: () => CustomRulesDeclarationTree;
  shortcuts: RegleShortcutDefinition | undefined;
  schemaErrors?: Ref<any | undefined>;
  schemaMode?: boolean;
  onValidate?: () => Promise<$InternalRegleResult>;
}) {
  const storage = useStorage();

  const regle = ref<$InternalRegleStatusType>();

  if (isNestedRulesDef(state, scopeRules)) {
    regle.value = createReactiveNestedStatus({
      rootRules: scopeRules,
      rulesDef: scopeRules,
      state: state as Ref<Record<string, any>>,
      customMessages: customRules?.(),
      storage,
      options,
      externalErrors: options.externalErrors as any,
      validationGroups: options.validationGroups as any,
      initialState: initialState as Ref<Record<string, any>>,
      shortcuts: shortcuts as $InternalRegleShortcutDefinition,
      fieldName: 'root',
      path: '',
      cachePath: '',
      schemaErrors,
      rootSchemaErrors: schemaErrors,
      schemaMode,
      onValidate,
    });
  } else if (isValidatorRulesDef(scopeRules)) {
    regle.value = createReactiveFieldStatus({
      rulesDef: scopeRules,
      state: state as Ref<Record<string, any>>,
      customMessages: customRules?.(),
      storage,
      options,
      externalErrors: options.externalErrors as any,
      initialState,
      shortcuts: shortcuts as $InternalRegleShortcutDefinition,
      fieldName: 'root',
      path: '',
      cachePath: '',
      schemaMode,
      schemaErrors,
      onValidate,
    });
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      regle.value?.$unwatch();
    });
  }

  return reactive({ regle });
}
