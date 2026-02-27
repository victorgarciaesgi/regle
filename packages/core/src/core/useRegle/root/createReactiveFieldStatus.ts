import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, nextTick, reactive, ref, toRef, toValue, watch, watchEffect } from 'vue';
import {
  abortablePromise,
  cloneDeep,
  debounce,
  isEmpty,
  isEqual,
  isObject,
  toDate,
  type AbortablePromiseResult,
  type DebouncedFunction,
} from '../../../../../shared';
import type {
  $InternalRegleFieldStatus,
  $InternalRegleResult,
  $InternalRegleRuleDecl,
  $InternalRegleRuleDefinition,
  $InternalRegleRuleStatus,
  CollectionRegleBehaviourOptions,
  FieldRegleBehaviourOptions,
  isEditedHandlerFn,
  RegleFieldIssue,
  RegleRuleDecl,
  RegleShortcutDefinition,
  ResetOptions,
} from '../../../types';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../utils';
import { extractRulesIssues, extractRulesTooltips } from '../useErrors';
import type { CommonResolverOptions, CommonResolverScopedState } from './common/common-types';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';
import { createStandardSchema } from './standard-schemas';
import { isStatic } from '../guards';

const DEFAULT_DEBOUNCE_TIME = 200;

interface CreateReactiveFieldStatusArgs extends CommonResolverOptions {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleRuleDecl>;
  externalErrors: Ref<string[] | undefined> | undefined;
  schemaErrors?: Ref<RegleFieldIssue[] | undefined> | undefined;
  schemaMode: boolean | undefined;
  onUnwatch?: () => void;
  $isArray?: boolean;
  initialState: Ref<unknown | undefined>;
  originalState: unknown | undefined;
  onValidate?: () => Promise<$InternalRegleResult>;
}

export function createReactiveFieldStatus({
  state,
  rulesDef,
  customMessages,
  path,
  cachePath,
  fieldName,
  storage,
  options,
  externalErrors,
  schemaErrors,
  schemaMode,
  onUnwatch,
  $isArray,
  initialState,
  originalState,
  shortcuts,
  overrides,
  onValidate,
}: CreateReactiveFieldStatusArgs): $InternalRegleFieldStatus {
  interface ScopeReturnState extends CommonResolverScopedState {
    $debounce: ComputedRef<number>;
    $deepCompare: ComputedRef<boolean | undefined>;
    $lazy: ComputedRef<boolean>;
    $rewardEarly: ComputedRef<boolean>;
    $autoDirty: ComputedRef<boolean>;
    $silent: ComputedRef<boolean>;
    $clearExternalErrorsOnChange: ComputedRef<boolean>;
    $clearExternalErrorsOnValidate: ComputedRef<boolean>;
    $immediateDirty: ComputedRef<boolean>;
    $issues: ComputedRef<RegleFieldIssue[]>;
    $silentIssues: ComputedRef<RegleFieldIssue[]>;
    $errors: ComputedRef<string[]>;
    $silentErrors: ComputedRef<string[]>;
    $tooltips: ComputedRef<string[]>;
    $haveAnyAsyncRule: ComputedRef<boolean>;
    $ready: ComputedRef<boolean>;
    $shortcuts: ToRefs<RegleShortcutDefinition['fields']>;
    $validating: Ref<boolean>;
    $dirty: Ref<boolean>;
    $silentValue: ComputedRef<unknown>;
    $inactive: ComputedRef<boolean>;
    $modifiers: ComputedRef<FieldRegleBehaviourOptions<unknown>>;
    $isArrayOrRegleStatic: ComputedRef<boolean>;
    processShortcuts: () => void;
  }

  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  let fieldScopes: EffectScope[] = [];

  let $unwatchState: WatchStopHandle;
  let $unwatchDirty: WatchStopHandle;
  let $unwatchAsync: WatchStopHandle;
  let $unwatchRuleFieldValues: WatchStopHandle;

  let $commit: DebouncedFunction<() => void> | (() => void) = () => {};
  let $validateAbortablePromise: AbortablePromiseResult<unknown> | undefined;
  let $setDirty: DebouncedFunction<() => void> | (() => void) = () => {};

  const $isDebouncing = ref(false);

  const additionalRules = ref<RegleRuleDecl<unknown, any>>(storage.getAdditionalRulesEntry(cachePath) ?? {});

  function addRules(rules: RegleRuleDecl) {
    additionalRules.value = rules ?? {};
    storage.addAdditionalRulesEntry(cachePath, rules ?? {});
    createRuleProcessor();
    $commit();
  }

  function createRuleProcessor() {
    const rules = { ...rulesDef.value, ...additionalRules.value };
    const entries: [string, $InternalRegleRuleStatus][] = [];

    for (const ruleKey in rules) {
      if (ruleKey.startsWith('$') || ruleKey.startsWith('~')) continue;

      const rule = rules[ruleKey];
      if (!rule) continue;

      const ruleRef = toRef(() => rule);
      entries.push([
        ruleKey,
        createReactiveRuleStatus({
          modifiers: {
            $silent: scopeState.$silent,
            $rewardEarly: scopeState.$rewardEarly,
          },
          customMessages,
          rule: ruleRef as Ref<$InternalRegleRuleDefinition>,
          ruleKey,
          state,
          path,
          cachePath,
          storage,
          $debounce: $localOptions.value.$debounce,
        }),
      ]);
    }

    $rules.value = Object.fromEntries(entries);

    storage.addRuleDeclEntry(cachePath, rules);
  }

  function createRuleDeclEntry():
    | {
        valid: boolean;
      }
    | undefined {
    const declaredRules = { ...rulesDef.value, ...additionalRules.value };
    const storeResult = storage.checkRuleDeclEntry(cachePath, declaredRules);

    const options: Record<string, unknown> = {};
    for (const key in declaredRules) {
      if (key.startsWith('$')) {
        options[key] = declaredRules[key];
      }
    }
    $localOptions.value = options;

    return storeResult;
  }

  function createReactiveRulesResult() {
    const storeResult = createRuleDeclEntry();

    $watch();

    createRuleProcessor();

    scopeState.processShortcuts();

    define$commit();
    define$setDirty();

    if (storeResult?.valid != null) {
      scopeState.$dirty.value = storage.getDirtyState(cachePath);
      if (
        (scopeState.$dirty.value && !scopeState.$silent.value) ||
        (scopeState.$rewardEarly.value && scopeState.$error.value)
      ) {
        $commit();
      }
    }

    storage.addRuleDeclEntry(cachePath, rulesDef.value);
  }

  function define$commit() {
    if (scopeState.$debounce.value > 0) {
      $commit = debounce($commitHandler, scopeState.$debounce.value, {
        trackDebounceRef: $isDebouncing,
      });
    } else {
      $commit = $commitHandler;
    }
  }

  function define$setDirty() {
    if (scopeState.$debounce.value > 0) {
      $setDirty = debounce(() => {
        scopeState.$dirty.value = true;
      }, scopeState.$debounce.value);
    } else {
      $setDirty = () => {
        scopeState.$dirty.value = true;
      };
    }
  }

  function $unwatch() {
    if ($rules.value) {
      for (const rule of Object.values($rules.value)) {
        rule.$unwatch();
      }
    }

    $unwatchDirty();
    $unwatchRuleFieldValues?.();
    if (scopeState.$dirty.value) {
      storage.setDirtyEntry(cachePath, scopeState.$dirty.value);
    }

    $unwatchState?.();
    scope.stop();
    scope = effectScope();
    for (const s of fieldScopes) {
      s.stop();
    }
    fieldScopes = [];
    onUnwatch?.();
    $unwatchAsync?.();
  }

  function $watch() {
    if ($rules.value) {
      for (const rule of Object.values($rules.value)) {
        rule.$watch();
      }
    }
    scopeState = scope.run(() => {
      const $dirty = ref(false);
      const triggerPunishment = ref(false);

      const $anyDirty = computed<boolean>(() => $dirty.value);

      const $isArrayOrRegleStatic = computed<boolean>(() => {
        return $isArray || isStatic(state.value);
      });

      const $debounce = computed<number>(() => {
        if ($localOptions.value.$debounce != null) {
          return $localOptions.value.$debounce;
        }
        if (scopeState.$haveAnyAsyncRule.value) {
          return DEFAULT_DEBOUNCE_TIME;
        }
        return 0;
      });

      const $deepCompare = computed<boolean | undefined>(() => {
        if ($localOptions.value.$deepCompare != null) {
          return $localOptions.value.$deepCompare;
        }
        return false;
      });

      const $lazy = computed<boolean>(() => {
        if ($localOptions.value.$lazy != null) {
          return $localOptions.value.$lazy;
        } else if (toValue(options.lazy) != null) {
          return toValue(options.lazy) === true;
        }
        return false;
      });

      const $immediateDirty = computed<boolean>(() => {
        if ($localOptions.value.$immediateDirty != null) {
          return $localOptions.value.$immediateDirty;
        } else if (toValue(options.immediateDirty) != null) {
          return toValue(options.immediateDirty) === true;
        }
        return false;
      });

      const $rewardEarly = computed<boolean>(() => {
        if ($localOptions.value.$rewardEarly != null) {
          return !!$localOptions.value.$rewardEarly;
        } else if (toValue(options.rewardEarly) != null) {
          return toValue(options.rewardEarly) === true;
        }
        return false;
      });

      const $clearExternalErrorsOnChange = computed<boolean>(() => {
        if ($localOptions.value.$clearExternalErrorsOnChange != null) {
          return !!$localOptions.value.$clearExternalErrorsOnChange;
        } else if (toValue(options.clearExternalErrorsOnChange) != null) {
          return toValue(options.clearExternalErrorsOnChange) === true;
        } else if ($silent.value) {
          return false;
        }
        return true;
      });

      const $clearExternalErrorsOnValidate = computed<boolean>(() => {
        if ($localOptions.value.$clearExternalErrorsOnValidate != null) {
          return !!$localOptions.value.$clearExternalErrorsOnValidate;
        } else if (toValue(options.clearExternalErrorsOnValidate) != null) {
          return toValue(options.clearExternalErrorsOnValidate) === true;
        }
        return false;
      });

      const $silent = computed<boolean>(() => {
        if ($rewardEarly.value) {
          return true;
        } else if ($localOptions.value.$silent != null) {
          return $localOptions.value.$silent;
        } else if (toValue(options.silent) != null) {
          return toValue(options.silent) === true;
        } else {
          return false;
        }
      });

      const $autoDirty = computed<boolean>(() => {
        if ($localOptions.value.$autoDirty != null) {
          return $localOptions.value.$autoDirty;
        } else if (toValue(options.autoDirty) != null) {
          return toValue(options.autoDirty) === true;
        }
        return true;
      });

      const $isEdited = computed<isEditedHandlerFn<unknown> | undefined>(() => {
        if ($localOptions.value.$isEdited != null) {
          return $localOptions.value.$isEdited;
        } else if (overrides?.isEdited != null) {
          return overrides.isEdited;
        }
        return undefined;
      });

      const $validating = computed(() => {
        for (const ruleResult of Object.values($rules.value)) {
          if (ruleResult.$validating) return true;
        }
        return false;
      });

      const $silentValue = computed({
        get: () => state.value,
        set(value) {
          $unwatchState();
          state.value = value;
          define$watchState();
        },
      });

      const $error = computed<boolean>(() => {
        if ($isDebouncing.value) {
          return $invalid.value && $dirty.value;
        } else {
          return $invalid.value && !$pending.value && $dirty.value;
        }
      });

      const $issues = computed<RegleFieldIssue[]>(() => {
        return extractRulesIssues({
          field: {
            $rules: $rules.value,
            $error: $error.value,
            $externalErrors: externalErrors?.value,
            $schemaErrors: schemaErrors?.value,
            fieldName: $name.value,
          },
        });
      });

      const $silentIssues = computed<RegleFieldIssue[]>(() => {
        return extractRulesIssues({
          field: {
            $rules: $rules.value,
            $error: $error.value,
            $externalErrors: externalErrors?.value,
            $schemaErrors: schemaErrors?.value,
            fieldName: $name.value,
          },
          silent: true,
        });
      });

      const $errors = computed<string[]>(() => {
        return $issues.value.map((issue) => issue.$message);
      });

      const $silentErrors = computed<string[]>(() => {
        return $silentIssues.value.map((issue) => issue.$message);
      });

      const $edited = ref(false);

      function isEditedHandler(currentValue: unknown, initialValue: unknown): boolean {
        if (initialValue instanceof Date && currentValue instanceof Date) {
          return toDate(initialValue).getDate() !== toDate(currentValue).getDate();
        } else if (initialValue == null) {
          // Keep empty string as the same value of undefined|null
          return !!currentValue;
        } else if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
          return !isEqual(currentValue, initialValue, $localOptions.value.$deepCompare);
        }
        return initialValue !== currentValue;
      }

      watchEffect(() => {
        if ($dirty.value) {
          if ($isEdited.value) {
            $edited.value = $isEdited.value(state.value, initialState.value, isEditedHandler);
          } else {
            $edited.value = isEditedHandler(state.value, initialState.value);
          }
        } else {
          $edited.value = false;
        }
      });

      const $anyEdited = computed(() => $edited.value);

      const $tooltips = computed<string[]>(() => {
        return extractRulesTooltips({
          field: {
            $rules: $rules.value,
          },
        });
      });

      const $ready = computed<boolean>(() => {
        return !($invalid.value || $pending.value);
      });

      const $pending = computed<boolean>(() => {
        if (triggerPunishment.value || !$rewardEarly.value) {
          return Object.entries($rules.value).some(([_, ruleResult]) => {
            return ruleResult.$pending;
          });
        }
        return false;
      });

      const $invalid = computed<boolean>(() => {
        if (externalErrors?.value?.length || schemaErrors?.value?.length) {
          return true;
        } else if ($inactive.value) {
          return false;
        } else {
          return Object.values($rules.value).some((ruleResult) => !ruleResult.$valid || ruleResult.$maybePending);
        }
      });

      const $name = computed<string>(() => fieldName ?? options.id ?? 'root');

      const $inactive = computed<boolean>(() => {
        return !schemaMode && !Object.keys($rules.value).some((key) => !key.startsWith('$'));
      });

      const $correct = computed<boolean>(() => {
        if (externalErrors?.value?.length) {
          return false;
        } else if ($inactive.value) {
          return false;
        } else if ($isDebouncing.value) {
          return false;
        } else if ($dirty.value && !isEmpty(state.value) && !$validating.value && !$pending.value) {
          if (schemaMode) {
            return !schemaErrors?.value?.length;
          } else {
            const rules = Object.values($rules.value);
            for (const rule of rules) {
              if (rule.$active) {
                if (!rule.$valid) return false;
              }
            }
            return rules.some((rule) => rule.$active);
          }
        }
        return false;
      });

      const $haveAnyAsyncRule = computed(() => {
        return Object.values($rules.value).some((rule) => rule.$haveAsync);
      });

      const $modifiers = computed<FieldRegleBehaviourOptions<unknown>>(() => {
        return {
          $debounce: $debounce.value,
          $lazy: $lazy.value,
          $rewardEarly: $rewardEarly.value,
          $autoDirty: $autoDirty.value,
          $silent: $silent.value,
          $clearExternalErrorsOnChange: $clearExternalErrorsOnChange.value,
          $clearExternalErrorsOnValidate: $clearExternalErrorsOnValidate.value,
          $immediateDirty: $immediateDirty.value,
          $isEdited: $isEdited.value,
          $disabled: toValue(options.disabled) ?? false,
        };
      });

      function processShortcuts() {
        if (shortcuts?.fields) {
          Object.entries(shortcuts.fields).forEach(([key, value]) => {
            const scope = effectScope();

            $shortcuts[key] = scope.run(() => {
              const result = ref();

              watchEffect(() => {
                result.value = value(
                  reactive({
                    $dirty,
                    $externalErrors: externalErrors?.value ?? [],
                    $value: state,
                    $silentValue,
                    $rules,
                    $error,
                    $pending,
                    $invalid,
                    $correct,
                    $errors,
                    $ready,
                    $silentErrors,
                    $anyDirty,
                    $tooltips,
                    $name,
                    $inactive,
                    $edited,
                    $anyEdited,
                  })
                );
              });
              return result;
            })!;

            fieldScopes.push(scope);
          });
        }
      }

      const $shortcuts: ToRefs<Record<string, Readonly<Ref<any>>>> = {};

      return {
        $error,
        $pending,
        $invalid,
        $correct,
        $debounce,
        $deepCompare,
        $lazy,
        $immediateDirty,
        $ready,
        $issues,
        $silentIssues,
        $errors,
        $silentErrors,
        $rewardEarly,
        $autoDirty,
        $silent,
        $clearExternalErrorsOnChange,
        $clearExternalErrorsOnValidate,
        $anyDirty,
        $edited,
        $anyEdited,
        $name,
        $haveAnyAsyncRule,
        $shortcuts,
        $validating,
        $tooltips,
        $dirty,
        processShortcuts,
        $silentValue,
        $inactive,
        $modifiers,
        $isArrayOrRegleStatic,
      } satisfies ScopeReturnState;
    })!;

    define$watchState();

    $unwatchDirty = watch(scopeState.$dirty, (newDirty) => {
      storage.setDirtyEntry(cachePath, newDirty);
      Object.values($rules.value).forEach((rule) => {
        rule.$fieldDirty = newDirty;
      });
    });

    $unwatchRuleFieldValues = watch(
      [scopeState.$error, scopeState.$correct, scopeState.$invalid, scopeState.$pending],
      () => {
        Object.values($rules.value).forEach((rule) => {
          rule.$fieldError = scopeState.$error.value;
          rule.$fieldInvalid = scopeState.$invalid.value;
          rule.$fieldPending = scopeState.$pending.value;
          rule.$fieldCorrect = scopeState.$correct.value;
        });
      }
    );

    $unwatchAsync = watch(scopeState.$haveAnyAsyncRule, define$commit);
  }

  function define$watchState() {
    $unwatchState = watch(
      state,
      () => {
        if (scopeState.$autoDirty.value && !scopeState.$silent.value) {
          if (!scopeState.$dirty.value) {
            $setDirty();
          }
        }

        if (rulesDef.value instanceof Function) {
          createReactiveRulesResult();
        }
        if (!scopeState.$silent.value || (scopeState.$rewardEarly.value && scopeState.$error.value)) {
          $commit();
        }
        if (scopeState.$clearExternalErrorsOnChange.value) {
          $clearExternalErrors();
        }
      },
      { deep: scopeState.$isArrayOrRegleStatic.value ? true : isVueSuperiorOrEqualTo3dotFive ? 1 : true }
    );
  }

  async function $commitHandler() {
    try {
      const { promise } = registerValidateAbortablePromise(
        Promise.allSettled(Object.values($rules.value).map((rule) => rule.$parse()))
      );
      await promise;
    } catch {}
  }

  const $rules = ref({}) as Ref<Record<string, $InternalRegleRuleStatus>>;
  const $localOptions = ref({}) as Ref<CollectionRegleBehaviourOptions>;

  createReactiveRulesResult();

  function $reset(options?: ResetOptions<unknown>, fromParent?: boolean): void {
    abortCommit();
    $clearExternalErrors();
    scopeState.$dirty.value = false;
    storage.setDirtyEntry(cachePath, false);

    if (!fromParent) {
      if (options?.toOriginalState) {
        state.value = cloneDeep(originalState);
        initialState.value = cloneDeep(originalState);
      } else if (options?.toInitialState) {
        state.value = cloneDeep(initialState.value);
      } else if (options?.toState) {
        let newInitialState: unknown;
        if (typeof options?.toState === 'function') {
          newInitialState = options?.toState();
        } else {
          newInitialState = options?.toState;
        }
        initialState.value = cloneDeep(newInitialState);
        state.value = cloneDeep(newInitialState);
      } else {
        initialState.value =
          isObject(state.value) && !isStatic(state.value)
            ? cloneDeep(state.value)
            : Array.isArray(state.value)
              ? [...state.value]
              : state.value;
      }
    }

    if (options?.clearExternalErrors) {
      $clearExternalErrors();
    }

    if (!fromParent && !options?.keepValidationState) {
      for (const rule of Object.values($rules.value)) {
        rule.$reset();
      }
    }

    if (!scopeState.$lazy.value && !scopeState.$silent.value && !fromParent) {
      for (const rule of Object.values($rules.value)) {
        rule.$parse();
      }
    }
  }

  function abortCommit() {
    if ('cancel' in $commit) {
      $commit.cancel();
    }
  }

  function registerValidateAbortablePromise<T>(promise: Promise<T>): AbortablePromiseResult<T> {
    if ($validateAbortablePromise) {
      $validateAbortablePromise.abort();
    }
    $validateAbortablePromise = abortablePromise(promise);
    return $validateAbortablePromise as AbortablePromiseResult<T>;
  }

  function $abort() {
    abortCommit();
    if ($validateAbortablePromise) {
      $validateAbortablePromise.abort();
    }
  }

  function $touch(runCommit = true, withConditions = false): void {
    if (!scopeState.$dirty.value) {
      $setDirty();
    }

    if (withConditions && runCommit) {
      if (!scopeState.$silent.value || (scopeState.$rewardEarly.value && scopeState.$error.value)) {
        abortCommit();
        $commit();
      }
    } else if (runCommit) {
      abortCommit();
      $commit();
    }
  }

  async function $validate(forceValues?: any): Promise<$InternalRegleResult> {
    try {
      if (forceValues) {
        state.value = forceValues;
      }
      if (schemaMode) {
        if (onValidate) {
          $touch(false);
          return onValidate();
        } else {
          return {
            valid: false,
            data: state.value,
            errors: scopeState.$errors.value,
            issues: scopeState.$issues.value,
          };
        }
      }

      const data = state.value;

      if (!scopeState.$dirty.value) {
        scopeState.$dirty.value = true;
      }
      if (isEmpty($rules.value)) {
        return { valid: true, data, errors: scopeState.$errors.value, issues: scopeState.$issues.value };
      }

      $abort();
      const { promise } = registerValidateAbortablePromise(
        Promise.allSettled(Object.values($rules.value).map((rule) => rule.$parse()))
      );
      const results = await promise;

      await nextTick();

      const validationResults = results.every((value) => value.status === 'fulfilled' && value.value === true);

      return { valid: validationResults, data, errors: scopeState.$errors.value, issues: scopeState.$issues.value };
    } catch {
      return { valid: false, data: state.value, errors: scopeState.$errors.value, issues: scopeState.$issues.value };
    }
  }

  /**
   * Validates the field synchronously by running $parseSync on all rules.
   * Async rules are skipped and assumed valid.
   * @param forceValues - Optional value to set before validating
   * @returns true if all sync rules pass, false if any fail or in schema mode
   */
  function $validateSync(forceValues?: any): boolean {
    try {
      if (forceValues) {
        state.value = forceValues;
      }
      if (!scopeState.$dirty.value) {
        scopeState.$dirty.value = true;
      }
      if (schemaMode) {
        return false;
      }

      const result = Object.values($rules.value)
        .map((rule) => rule.$parseSync())
        .every((result) => !!result);

      return result;
    } catch {
      return false;
    }
  }

  function $extractDirtyFields(filterNullishValues: boolean = true): unknown | null | { _null: true } {
    if (scopeState.$dirty.value) {
      return state.value;
    }
    if (filterNullishValues) {
      // Differentiate untouched empty values from dirty empty ones
      return { _null: true };
    }
    return null;
  }

  function $clearExternalErrors() {
    if (externalErrors?.value?.length) {
      externalErrors.value = [];
    }
  }

  if (!scopeState.$lazy.value && !scopeState.$dirty.value && !scopeState.$silent.value) {
    $commitHandler();
  }

  if (scopeState.$immediateDirty.value) {
    scopeState.$dirty.value = true;
  }

  // oxlint-disable typescript-eslint/no-unused-vars
  const {
    $shortcuts,
    $validating,
    $autoDirty,
    $rewardEarly,
    $clearExternalErrorsOnChange,
    $clearExternalErrorsOnValidate,
    $haveAnyAsyncRule,
    $debounce,
    $lazy,
    ...restScope
  } = scopeState;
  // oxlint-enable typescript-eslint/no-unused-vars

  const fullStatus = reactive({
    ...restScope,
    $externalErrors: externalErrors,
    $value: state,
    $initialValue: initialState,
    $originalValue: originalState,
    $rules: $rules,
    ...$shortcuts,
    $path: path,
    $isDebouncing,
    $reset,
    $touch,
    $validate,
    $validateSync,
    $unwatch,
    $watch,
    $extractDirtyFields,
    $clearExternalErrors,
    $abort,
    addRules,
    $schemaMode: schemaMode,
    '~modifiers': scopeState.$modifiers,
    ...createStandardSchema($validate),
  }) satisfies $InternalRegleFieldStatus;

  Object.defineProperty(fullStatus, Symbol.for('regle:instance'), { value: true });

  return fullStatus;
}
