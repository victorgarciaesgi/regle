import type { EffectScope, Ref, WatchStopHandle } from 'vue';
import { effectScope, getCurrentScope, nextTick, onScopeDispose, ref, toValue, watch } from 'vue';
import { dotPathObjectToNested, isObject } from '../../../../../shared';
import { registerRegleInstance } from '../../../devtools';
import type {
  $InternalRegleErrorTree,
  $InternalReglePartialRuleTree,
  $InternalRegleResult,
  $InternalRegleShortcutDefinition,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  GlobalConfigOverrides,
  PrimitiveTypes,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { useStorage } from '../../useStorage';
import { isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';

/**
 * @internal
 * This is the internal function that creates the root storage for the Regle instance.
 * This allows shared logic between all `useRegle` like composables
 */
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
  overrides,
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
  overrides: GlobalConfigOverrides | undefined;
}) {
  const storage = useStorage();
  const isEnabled = ref(false);
  const attachedScopes = new Set<EffectScope>();
  let rootScope: EffectScope | undefined;

  const regle = ref<$InternalRegleStatusType>();
  const computedExternalErrors = ref<$InternalRegleErrorTree | undefined | string[]>();

  let $unwatchExternalErrors: WatchStopHandle | undefined;
  let $unwatchComputedExternalErrors: WatchStopHandle | undefined;
  let $unwatchDisabled: WatchStopHandle | undefined;

  function defineDisabledWatchSource() {
    $unwatchDisabled = watch(
      () => toValue(options.disabled),
      async (disabled) => {
        if (disabled) {
          unwatchRegle();
        } else {
          createRegleInstance();
          defineExternalErrorsWatchSource();
        }
      }
    );
  }

  function handleExternalErrorsChange(newErrors: $InternalRegleErrorTree | undefined | string[]) {
    $unwatchComputedExternalErrors?.();
    if (newErrors) {
      if (isObject(newErrors) && Object.keys(newErrors).some((key) => key.includes('.'))) {
        computedExternalErrors.value = dotPathObjectToNested(newErrors);
      } else if (Array.isArray(newErrors)) {
        computedExternalErrors.value = newErrors;
      } else {
        computedExternalErrors.value = newErrors ?? {};
      }
    }

    defineComputedExternalErrorsWatchSource();
  }

  function defineExternalErrorsWatchSource() {
    $unwatchExternalErrors = watch(() => options.externalErrors?.value, handleExternalErrorsChange, { deep: true });
  }

  function defineComputedExternalErrorsWatchSource() {
    $unwatchComputedExternalErrors = watch(
      () => computedExternalErrors.value,
      (newErrors) => {
        $unwatchExternalErrors?.();
        if (options.externalErrors?.value) {
          options.externalErrors.value = newErrors as any;
        }
        handleExternalErrorsChange(newErrors);
        defineExternalErrorsWatchSource();
      },
      { deep: true }
    );
  }

  function createRegleInstance() {
    if (isNestedRulesDef(state, scopeRules)) {
      regle.value = createReactiveNestedStatus({
        rootRules: scopeRules,
        rulesDef: scopeRules,
        state: state as Ref<Record<string, any>>,
        customMessages: customRules?.(),
        storage,
        options,
        externalErrors: computedExternalErrors as Ref<$InternalRegleErrorTree>,
        validationGroups: options.validationGroups as any,
        initialState: initialState as Ref<Record<string, any>>,
        originalState: originalState as Record<string, any>,
        shortcuts: shortcuts as $InternalRegleShortcutDefinition,
        fieldName: undefined,
        path: '',
        cachePath: '',
        schemaErrors,
        rootSchemaErrors: schemaErrors,
        schemaMode,
        onValidate,
        overrides,
      });
    } else if (isValidatorRulesDef(scopeRules)) {
      regle.value = createReactiveFieldStatus({
        rulesDef: scopeRules,
        state: state as Ref<Record<string, any>>,
        customMessages: customRules?.(),
        storage,
        options,
        externalErrors: computedExternalErrors as Ref<string[]>,
        initialState,
        originalState: originalState,
        shortcuts: shortcuts as $InternalRegleShortcutDefinition,
        fieldName: undefined,
        path: '',
        cachePath: '',
        schemaMode,
        schemaErrors,
        onValidate,
        overrides,
      });
    }
  }

  function clearWatchHandles() {
    $unwatchComputedExternalErrors = undefined;
    $unwatchExternalErrors = undefined;
    $unwatchDisabled = undefined;
  }

  function unwatchRegle() {
    regle.value?.$unwatch();
    $unwatchComputedExternalErrors?.();
    $unwatchExternalErrors?.();
  }

  function startRootStorage() {
    if (isEnabled.value) return;

    isEnabled.value = true;
    rootScope = effectScope(true);
    rootScope.run(() => {
      handleExternalErrorsChange(options.externalErrors?.value);

      createRegleInstance();

      if (toValue(options.disabled)) {
        nextTick().then(() => {
          regle.value?.$unwatch();
        });
      } else {
        defineExternalErrorsWatchSource();
      }

      defineDisabledWatchSource();
    });
  }

  function stopRootStorage() {
    if (!isEnabled.value) return;

    isEnabled.value = false;
    unwatchRegle();
    $unwatchDisabled?.();
    clearWatchHandles();
    rootScope?.stop();
    rootScope = undefined;
  }

  function bindToCurrentScope() {
    const currentScope = getCurrentScope();

    if (!currentScope || attachedScopes.has(currentScope)) return;
    if (!isEnabled.value) {
      startRootStorage();
    }

    attachedScopes.add(currentScope);
    onScopeDispose(() => {
      attachedScopes.delete(currentScope);
      if (!attachedScopes.size) {
        stopRootStorage();
      }
    });
  }

  startRootStorage();
  bindToCurrentScope();

  function registerDevtools() {
    if (typeof window !== 'undefined' && __USE_DEVTOOLS__ && regle.value) {
      registerRegleInstance(regle.value as any, { name: toValue(options.id) });
    }
  }

  registerDevtools();

  return {
    regle,
    bindToCurrentScope,
  };
}
