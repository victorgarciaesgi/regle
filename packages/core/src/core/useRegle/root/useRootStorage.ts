import type { EffectScope, Ref, WatchStopHandle } from 'vue';
import { effectScope, getCurrentScope, nextTick, onScopeDispose, ref, toValue, watch } from 'vue';
import { isObject, normalizeDotPathExternalValue } from '../../../../../shared';
import { registerRegleInstance } from '../../../devtools';
import type {
  $InternalRegleErrorTree,
  $InternalRegleExternalIssues,
  $InternalRegleIssuesTree,
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
import { isRegleDevtoolsTestEnv } from '../../../utils/devtools.utils';
import { useStorage } from '../../useStorage';
import { isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';

function hasExternalValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return isObject(value) && Object.keys(value).length > 0;
}

function emptyExternalValue(value: unknown) {
  return Array.isArray(value) ? [] : {};
}

function createExternalChannels(
  options: ResolvedRegleBehaviourOptions,
  state: Ref<Record<string, any> | PrimitiveTypes>
) {
  type ExternalErrors = $InternalRegleErrorTree | string[];
  type ExternalIssues = $InternalRegleExternalIssues;

  const externalErrors = ref<ExternalErrors | undefined>();
  const externalIssues = ref<ExternalIssues | undefined>();

  let unwatchOptionErrors: WatchStopHandle | undefined;
  let unwatchInternalErrors: WatchStopHandle | undefined;
  let unwatchOptionIssues: WatchStopHandle | undefined;
  let unwatchInternalIssues: WatchStopHandle | undefined;
  let syncing = false;

  function clearIssues() {
    const emptyIssues = emptyExternalValue(externalIssues.value ?? options.externalIssues?.value);
    externalIssues.value = emptyIssues as ExternalIssues;
    if (options.externalIssues) {
      options.externalIssues.value = emptyIssues as any;
    }
  }

  function clearErrors() {
    const emptyErrors = emptyExternalValue(externalErrors.value ?? options.externalErrors?.value);
    externalErrors.value = emptyErrors as ExternalErrors;
    if (options.externalErrors) {
      options.externalErrors.value = emptyErrors as any;
    }
  }

  function syncErrors(newErrors: ExternalErrors | undefined, updateOptionRef = false) {
    if (syncing) return;
    syncing = true;

    const normalizedErrors = normalizeDotPathExternalValue(newErrors, toValue(state));
    externalErrors.value = normalizedErrors;
    if (updateOptionRef && options.externalErrors) {
      options.externalErrors.value = normalizedErrors as any;
    }
    if (hasExternalValue(normalizedErrors)) {
      clearIssues();
    }

    syncing = false;
  }

  function syncIssues(newIssues: ExternalIssues | undefined, updateOptionRef = false) {
    if (syncing) return;
    syncing = true;

    const normalizedIssues = normalizeDotPathExternalValue(newIssues, toValue(state) as Record<string, unknown>);
    externalIssues.value = normalizedIssues;
    if (updateOptionRef && options.externalIssues) {
      options.externalIssues.value = normalizedIssues as any;
    }
    if (hasExternalValue(normalizedIssues)) {
      clearErrors();
    }

    syncing = false;
  }

  function watchOptionRefs() {
    unwatchOptionErrors?.();
    unwatchOptionIssues?.();
    unwatchOptionErrors = watch(
      () => options.externalErrors?.value,
      (errors) => syncErrors(errors as ExternalErrors),
      {
        deep: true,
      }
    );
    unwatchOptionIssues = watch(
      () => options.externalIssues?.value,
      (issues) => syncIssues(issues as ExternalIssues),
      {
        deep: true,
      }
    );
  }

  function watchInternalRefs() {
    unwatchInternalErrors?.();
    unwatchInternalIssues?.();
    unwatchInternalErrors = watch(
      () => externalErrors.value,
      (errors) => syncErrors(errors, true),
      { deep: true }
    );
    unwatchInternalIssues = watch(
      () => externalIssues.value,
      (issues) => syncIssues(issues, true),
      { deep: true }
    );
  }

  function start() {
    stop();
    syncErrors(options.externalErrors?.value);
    syncIssues(options.externalIssues?.value as $InternalRegleExternalIssues);
    watchInternalRefs();
  }

  function stop() {
    unwatchInternalErrors?.();
    unwatchOptionErrors?.();
    unwatchInternalIssues?.();
    unwatchOptionIssues?.();
    unwatchInternalErrors = undefined;
    unwatchOptionErrors = undefined;
    unwatchInternalIssues = undefined;
    unwatchOptionIssues = undefined;
  }

  return {
    externalErrors,
    externalIssues,
    start,
    watchOptionRefs,
    stop,
  };
}

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
  const externalChannels = createExternalChannels(options, state);

  let $unwatchDisabled: WatchStopHandle | undefined;

  function defineDisabledWatchSource() {
    $unwatchDisabled = watch(
      () => toValue(options.disabled),
      async (disabled) => {
        if (disabled) {
          unwatchRegle();
        } else {
          createRegleInstance();
          externalChannels.start();
          externalChannels.watchOptionRefs();
        }
      }
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
        rootInitialState: initialState,
        externalErrors: externalChannels.externalErrors as Ref<$InternalRegleErrorTree>,
        externalIssues: externalChannels.externalIssues as unknown as Ref<$InternalRegleIssuesTree>,
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
        rootInitialState: initialState,
        externalErrors: externalChannels.externalErrors as Ref<string[]>,
        externalIssues: externalChannels.externalIssues as Ref<any[]>,
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
    $unwatchDisabled = undefined;
  }

  function unwatchRegle() {
    regle.value?.$unwatch();
    externalChannels.stop();
  }

  function startRootStorage() {
    if (isEnabled.value) return;

    isEnabled.value = true;
    rootScope = effectScope(true);
    rootScope.run(() => {
      externalChannels.start();

      createRegleInstance();

      if (toValue(options.disabled)) {
        nextTick().then(() => {
          regle.value?.$unwatch();
        });
      } else {
        externalChannels.watchOptionRefs();
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
    regle.value = undefined;
    storage.clearAll();
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
    if (
      typeof window !== 'undefined' &&
      (__USE_DEVTOOLS__ || (typeof __VUE_PROD_DEVTOOLS__ !== 'undefined' && __VUE_PROD_DEVTOOLS__)) &&
      !isRegleDevtoolsTestEnv() &&
      regle.value
    ) {
      registerRegleInstance(regle.value as any, { name: toValue(options.id) });
    }
  }

  registerDevtools();

  return {
    regle,
    bindToCurrentScope,
  };
}
