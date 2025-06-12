import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, unref, watch, watchEffect } from 'vue';
import { cloneDeep, debounce, isEmpty, isEqual, isFile, isObject, toDate } from '../../../../../shared';
import type {
  $InternalRegleFieldStatus,
  $InternalRegleResult,
  $InternalRegleRuleDecl,
  $InternalRegleRuleStatus,
  CollectionRegleBehaviourOptions,
  RegleFieldIssue,
  RegleRuleDecl,
  RegleShortcutDefinition,
  ResetOptions,
} from '../../../types';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../utils';
import { extractRulesIssues, extractRulesTooltips } from '../useErrors';
import type { CommonResolverOptions, CommonResolverScopedState } from './common/common-types';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';

interface CreateReactiveFieldStatusArgs extends CommonResolverOptions {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleRuleDecl>;
  externalErrors: Ref<string[] | undefined> | undefined;
  schemaErrors?: Ref<RegleFieldIssue[] | undefined> | undefined;
  schemaMode: boolean | undefined;
  onUnwatch?: () => void;
  $isArray?: boolean;
  initialState: Ref<unknown | undefined>;
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
  shortcuts,
  onValidate,
}: CreateReactiveFieldStatusArgs): $InternalRegleFieldStatus {
  interface ScopeReturnState extends CommonResolverScopedState {
    $debounce: ComputedRef<number | undefined>;
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
    processShortcuts: () => void;
  }

  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  let fieldScopes: EffectScope[] = [];

  let $unwatchState: WatchStopHandle;
  let $unwatchDirty: WatchStopHandle;
  let $unwatchAsync: WatchStopHandle;
  let $unwatchRuleFieldValues: WatchStopHandle;

  let $commit = () => {};

  function createReactiveRulesResult() {
    const declaredRules = rulesDef.value as RegleRuleDecl<any, any>;
    const storeResult = storage.checkRuleDeclEntry(cachePath, declaredRules);

    $localOptions.value = Object.fromEntries(
      Object.entries(declaredRules).filter(([ruleKey]) => ruleKey.startsWith('$'))
    );

    $watch();

    $rules.value = Object.fromEntries(
      Object.entries(rulesDef.value)
        .filter(([ruleKey]) => !ruleKey.startsWith('$'))
        .map(([ruleKey, rule]) => {
          if (rule) {
            const ruleRef = toRef(() => rule);
            return [
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
                path: path,
                cachePath: cachePath,
                storage,
                $debounce: $localOptions.value.$debounce,
              }),
            ];
          }

          return [];
        })
        .filter((ruleDef): ruleDef is [string, $InternalRegleRuleStatus] => !!ruleDef.length)
    );

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
    $commit = scopeState.$debounce.value
      ? debounce($commitHandler, (scopeState.$debounce.value ?? scopeState.$haveAnyAsyncRule) ? 100 : 0)
      : $commitHandler;
  }

  function $unwatch() {
    if ($rules.value) {
      Object.entries($rules.value).forEach(([_, rule]) => {
        rule.$unwatch();
      });
    }

    $unwatchDirty();
    $unwatchRuleFieldValues?.();
    if (scopeState.$dirty.value) {
      storage.setDirtyEntry(cachePath, scopeState.$dirty.value);
    }

    $unwatchState?.();
    scope.stop();
    scope = effectScope();
    fieldScopes.forEach((s) => s.stop());
    fieldScopes = [];
    onUnwatch?.();
    $unwatchAsync?.();
  }

  function $watch() {
    if ($rules.value) {
      Object.entries($rules.value).forEach(([_, rule]) => {
        rule.$watch();
      });
    }
    scopeState = scope.run(() => {
      const $dirty = ref(false);
      const triggerPunishment = ref(false);
      const $anyDirty = computed<boolean>(() => $dirty.value);
      const $debounce = computed<number | undefined>(() => {
        return $localOptions.value.$debounce;
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
        return Object.entries($rules.value).some(([key, ruleResult]) => {
          return ruleResult.$validating;
        });
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
        return $invalid.value && !$pending.value && $dirty.value;
      });

      const $issues = computed<RegleFieldIssue[]>(() => {
        return extractRulesIssues({
          field: {
            $rules: $rules.value,
            $error: $error.value,
            $externalErrors: externalErrors?.value,
            $schemaErrors: schemaErrors?.value,
            fieldName,
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
            fieldName,
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
          return Object.entries($rules.value).some(([key, ruleResult]) => {
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
        } else if (!$rewardEarly.value || $rewardEarly.value) {
          const result = Object.entries($rules.value).some(([_, ruleResult]) => {
            return !(ruleResult.$valid && !ruleResult.$maybePending);
          });

          return result;
        }
        return false;
      });

      const $name = computed<string>(() => fieldName);

      const $inactive = computed<boolean>(() => {
        if (Object.keys(rulesDef.value).filter(([ruleKey]) => !ruleKey.startsWith('$')).length === 0 && !schemaMode) {
          return true;
        }
        return false;
      });

      const $correct = computed<boolean>(() => {
        if (externalErrors?.value?.length) {
          return false;
        } else if ($inactive.value) {
          return false;
        } else if ($dirty.value && !isEmpty(state.value) && !$validating.value && !$pending.value) {
          if (schemaMode) {
            return !schemaErrors?.value?.length;
          } else {
            const atLeastOneActiveRule = Object.values($rules.value).some((ruleResult) => ruleResult.$active);
            if (atLeastOneActiveRule) {
              return Object.values($rules.value)
                .filter((ruleResult) => ruleResult.$active)
                .every((ruleResult) => ruleResult.$valid);
            } else {
              return false;
            }
          }
        }
        return false;
      });

      const $haveAnyAsyncRule = computed(() => {
        return Object.entries($rules.value).some(([key, ruleResult]) => {
          return ruleResult.$haveAsync;
        });
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
      { deep: $isArray ? true : isVueSuperiorOrEqualTo3dotFive ? 1 : true }
    );
  }

  function $commitHandler() {
    Object.values($rules.value).forEach((rule) => {
      rule.$parse();
    });
  }

  const $rules = ref({}) as Ref<Record<string, $InternalRegleRuleStatus>>;
  const $localOptions = ref({}) as Ref<CollectionRegleBehaviourOptions>;

  createReactiveRulesResult();

  function $reset(options?: ResetOptions<unknown>, fromParent?: boolean): void {
    $clearExternalErrors();
    scopeState.$dirty.value = false;
    storage.setDirtyEntry(cachePath, false);

    if (!fromParent) {
      if (options?.toInitialState) {
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

    if (!fromParent) {
      Object.entries($rules.value).forEach(([_, rule]) => {
        rule.$reset();
      });
    }

    if (!scopeState.$lazy.value && !scopeState.$silent.value && !fromParent) {
      Object.values($rules.value).forEach((rule) => {
        return rule.$parse();
      });
    }
  }

  function $touch(runCommit = true, withConditions = false): void {
    if (!scopeState.$dirty.value) {
      scopeState.$dirty.value = true;
    }

    if (withConditions && runCommit) {
      if (!scopeState.$silent.value || (scopeState.$rewardEarly.value && scopeState.$error.value)) {
        $commit();
      }
    } else if (runCommit) {
      $commit();
    }
  }

  async function $validate(): Promise<$InternalRegleResult> {
    try {
      if (schemaMode) {
        if (onValidate) {
          $touch(false);
          return onValidate();
        } else {
          return { valid: false, data: state.value };
        }
      }
      const data = state.value;

      if (!scopeState.$dirty.value) {
        scopeState.$dirty.value = true;
      } else if (!scopeState.$silent.value && scopeState.$dirty.value && !scopeState.$pending.value) {
        return { valid: !scopeState.$error.value, data };
      }
      if (schemaMode) {
        return { valid: !schemaErrors?.value?.length, data };
      } else if (isEmpty($rules.value)) {
        return { valid: true, data };
      }
      const results = await Promise.allSettled(
        Object.entries($rules.value).map(([key, rule]) => {
          return rule.$parse();
        })
      );

      const validationResults = results.every((value) => {
        if (value.status === 'fulfilled') {
          return value.value === true;
        } else {
          return false;
        }
      });

      return { valid: validationResults, data };
    } catch (e) {
      return { valid: false, data: state.value };
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
    $commit();
  }

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

  return reactive({
    ...restScope,
    $externalErrors: externalErrors,
    $value: state,
    $rules: $rules,
    ...$shortcuts,
    $path: path,
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
    $extractDirtyFields,
    $clearExternalErrors,
  }) satisfies $InternalRegleFieldStatus;
}
