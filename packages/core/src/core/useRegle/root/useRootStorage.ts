import type { Ref, WatchStopHandle } from 'vue';
import { getCurrentScope, onScopeDispose, reactive, ref, watch } from 'vue';
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
import { dotPathObjectToNested } from '../../../../../shared';

export function useRootStorage({
  initialState,
  originalState,
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
  originalState: Record<string, any> | PrimitiveTypes;
  customRules?: () => CustomRulesDeclarationTree;
  shortcuts: RegleShortcutDefinition | undefined;
  schemaErrors?: Ref<any | undefined>;
  schemaMode?: boolean;
  onValidate?: () => Promise<$InternalRegleResult>;
}) {
  const storage = useStorage();

  const regle = ref<$InternalRegleStatusType>();
  const computedExternalErrors = ref<$InternalRegleErrorTree | undefined>();

  let $unwatchExternalErrors: WatchStopHandle | undefined;
  let $unwatchComputedExternalErrors: WatchStopHandle | undefined;

  function defineExternalErrorsWatchSource() {
    $unwatchExternalErrors = watch(
      () => options.externalErrors?.value,
      () => {
        $unwatchComputedExternalErrors?.();
        if (
          options.externalErrors?.value &&
          Object.keys(options.externalErrors.value).some((key) => key.includes('.'))
        ) {
          computedExternalErrors.value = dotPathObjectToNested(options.externalErrors.value);
        } else {
          computedExternalErrors.value = options.externalErrors?.value as any;
        }

        defineComputedExternalErrorsWatchSource();
      },
      { immediate: true, deep: true }
    );
  }

  function defineComputedExternalErrorsWatchSource() {
    $unwatchComputedExternalErrors = watch(
      () => computedExternalErrors.value,
      () => {
        $unwatchExternalErrors?.();
        if (options.externalErrors?.value) {
          options.externalErrors.value = computedExternalErrors.value as any;
        }
        defineExternalErrorsWatchSource();
      },
      { deep: true }
    );
  }

  defineExternalErrorsWatchSource();

  if (isNestedRulesDef(state, scopeRules)) {
    regle.value = createReactiveNestedStatus({
      rootRules: scopeRules,
      rulesDef: scopeRules,
      state: state as Ref<Record<string, any>>,
      customMessages: customRules?.(),
      storage,
      options,
      externalErrors: computedExternalErrors,
      validationGroups: options.validationGroups as any,
      initialState: initialState as Ref<Record<string, any>>,
      originalState: originalState as Record<string, any>,
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
      externalErrors: computedExternalErrors as any,
      initialState,
      originalState: originalState,
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
      $unwatchComputedExternalErrors?.();
      $unwatchExternalErrors?.();
    });
  }

  return reactive({ regle });
}
