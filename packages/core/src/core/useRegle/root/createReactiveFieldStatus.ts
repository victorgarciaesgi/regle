import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, unref, watch, watchEffect } from 'vue';
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
  $InternalRegleRuleStatus,
  CollectionRegleBehaviourOptions,
  FieldRegleBehaviourOptions,
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
    $silentValue: ComputedRef<any>;
    $inactive: ComputedRef<boolean>;
    $modifiers: ComputedRef<FieldRegleBehaviourOptions>;
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
  let $validateAbortablePromise: AbortablePromiseResult<any> | undefined;

  const $isDebouncing = ref(false);

  function createReactiveRulesResult() {
    const declaredRules = rulesDef.value as RegleRuleDecl<any, any>;
    const storeResult = storage.checkRuleDeclEntry(cachePath, declaredRules);

    const options: Record<string, any> = {};
    for (const key in declaredRules) {
      if (key.startsWith('$')) {
        options[key] = declaredRules[key];
      }
    }
    $localOptions.value = options;

    $watch();

    const rules = rulesDef.value;
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
          rule: ruleRef as any,
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

    scopeState.processShortcuts();

    define$commit();

    if (storeResult?.valid != null) {
      scopeState.$dirty.value = storage.getDirtyState(cachePath);
      if (
        (scopeState.$dirty.value && !scopeState.$silent.value) ||
        (scopeState.$rewardEarly.value && scopeState.$error.value)
      ) {
        $commit();
      }
    }

    storage.addRuleDeclEntry(cachePath, declaredRules);
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
        } else if (unref(options.lazy) != null) {
          return unref(options.lazy);
        }
        return false;
      });

      const $rewardEarly = computed<boolean>(() => {
        if ($localOptions.value.$rewardEarly != null) {
          return $localOptions.value.$rewardEarly;
        } else if (unref(options.rewardEarly) != null) {
          return unref(options.rewardEarly);
        }
        return false;
      });

      const $clearExternalErrorsOnChange = computed<boolean>(() => {
        if ($localOptions.value.$clearExternalErrorsOnChange != null) {
          return $localOptions.value.$clearExternalErrorsOnChange;
        } else if (unref(options.clearExternalErrorsOnChange) != null) {
          return unref(options.clearExternalErrorsOnChange);
        } else if ($silent.value) {
          return false;
        }
        return true;
      });

      const $silent = computed<boolean>(() => {
        if ($rewardEarly.value) {
          return true;
        } else if ($localOptions.value.$silent != null) {
          return $localOptions.value.$silent;
        } else if (unref(options.silent) != null) {
          return unref(options.silent);
        } else return false;
      });

      const $autoDirty = computed<boolean>(() => {
        if ($localOptions.value.$autoDirty != null) {
          return $localOptions.value.$autoDirty;
        } else if (unref(options.autoDirty) != null) {
          return unref(options.autoDirty);
        }
        return true;
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

      const $edited = computed<boolean>(() => {
        if ($dirty.value) {
          if (initialState.value instanceof Date && state.value instanceof Date) {
            return toDate(initialState.value).getDate() !== toDate(state.value).getDate();
          } else if (initialState.value == null) {
            // Keep empty string as the same value of undefined|null
            return !!state.value;
          } else if (Array.isArray(state.value) && Array.isArray(initialState.value)) {
            return !isEqual(state.value, initialState.value, $localOptions.value.$deepCompare);
          }
          return initialState.value !== state.value;
        }
        return false;
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
        if ($silent.value) {
          return !($invalid.value || $pending.value);
        }
        return $anyDirty.value && !($invalid.value || $pending.value);
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
        if (schemaErrors?.value && !Array.isArray(schemaErrors?.value) && '$self' in schemaErrors.value) {
          // @ts-expect-error Errors from primitives only arrays from regle schemas
          return schemaErrors?.value.$self?.length > 0;
        } else if (externalErrors?.value?.length || schemaErrors?.value?.length) {
          return true;
        } else if ($inactive.value) {
          return false;
        } else {
          return Object.values($rules.value).some((ruleResult) => !ruleResult.$valid || ruleResult.$maybePending);
        }
      });

      const $name = computed<string>(() => fieldName ?? options.id ?? 'root');

      const $inactive = computed<boolean>(() => {
        return !schemaMode && !Object.keys(rulesDef.value).some((key) => !key.startsWith('$'));
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

      const $modifiers = computed<FieldRegleBehaviourOptions>(() => {
        return {
          $debounce: $debounce.value,
          $lazy: $lazy.value,
          $rewardEarly: $rewardEarly.value,
          $autoDirty: $autoDirty.value,
          $silent: $silent.value,
          $clearExternalErrorsOnChange: $clearExternalErrorsOnChange.value,
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
        $ready,
        $issues,
        $silentIssues,
        $errors,
        $silentErrors,
        $rewardEarly,
        $autoDirty,
        $silent,
        $clearExternalErrorsOnChange,
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
            scopeState.$dirty.value = true;
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
        initialState.value = isObject(state.value)
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
    return $validateAbortablePromise;
  }

  function $abort() {
    abortCommit();
    if ($validateAbortablePromise) {
      $validateAbortablePromise.abort();
    }
  }

  function $touch(runCommit = true, withConditions = false): void {
    if (!scopeState.$dirty.value) {
      scopeState.$dirty.value = true;
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
      } else if (
        !scopeState.$silent.value &&
        scopeState.$dirty.value &&
        !scopeState.$pending.value &&
        !$isDebouncing.value &&
        !scopeState.$haveAnyAsyncRule.value
      ) {
        return {
          valid: !scopeState.$error.value,
          data,
          errors: scopeState.$errors.value,
          issues: scopeState.$issues.value,
        };
      }
      if (schemaMode) {
        return {
          valid: !schemaErrors?.value?.length,
          data,
          errors: scopeState.$errors.value,
          issues: scopeState.$issues.value,
        };
      } else if (isEmpty($rules.value)) {
        return { valid: true, data, errors: scopeState.$errors.value, issues: scopeState.$issues.value };
      }

      $abort();
      const { promise } = registerValidateAbortablePromise(
        Promise.allSettled(Object.values($rules.value).map((rule) => rule.$parse()))
      );
      const results = await promise;

      const validationResults = results.every((value) => value.status === 'fulfilled' && value.value === true);

      return { valid: validationResults, data, errors: scopeState.$errors.value, issues: scopeState.$issues.value };
    } catch {
      return { valid: false, data: state.value, errors: scopeState.$errors.value, issues: scopeState.$issues.value };
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

  // oxlint-disable typescript-eslint/no-unused-vars
  const {
    $shortcuts,
    $validating,
    $autoDirty,
    $rewardEarly,
    $clearExternalErrorsOnChange,
    $haveAnyAsyncRule,
    $debounce,
    $lazy,
    ...restScope
  } = scopeState;
  // oxlint-enable typescript-eslint/no-unused-vars

  return reactive({
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
    $unwatch,
    $watch,
    $extractDirtyFields,
    $clearExternalErrors,
    $abort,
    '~modifiers': scopeState.$modifiers,
    ...createStandardSchema($validate),
  }) satisfies $InternalRegleFieldStatus;
}
