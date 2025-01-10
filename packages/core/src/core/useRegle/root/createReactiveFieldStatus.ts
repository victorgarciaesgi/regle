import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, unref, watch, watchEffect } from 'vue';
import { cloneDeep, isEmpty } from '../../../../../shared';
import type {
  $InternalRegleFieldStatus,
  $InternalRegleResult,
  $InternalRegleRuleDecl,
  $InternalRegleRuleStatus,
  FieldRegleBehaviourOptions,
  RegleRuleDecl,
  RegleShortcutDefinition,
} from '../../../types';
import { debounce, isVueSuperiorOrEqualTo3dotFive } from '../../../utils';
import { extractRulesErrors, extractRulesTooltips } from '../useErrors';
import type { CommonResolverOptions, CommonResolverScopedState } from './common/common-types';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';

interface CreateReactiveFieldStatusArgs extends CommonResolverOptions {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleRuleDecl>;
  externalErrors: Ref<string[] | undefined> | undefined;
  onUnwatch?: () => void;
  $isArray?: boolean;
  initialState: unknown | undefined;
}

export function createReactiveFieldStatus({
  state,
  rulesDef,
  customMessages,
  path,
  fieldName,
  storage,
  options,
  externalErrors,
  onUnwatch,
  $isArray,
  initialState,
  shortcuts,
}: CreateReactiveFieldStatusArgs): $InternalRegleFieldStatus {
  interface ScopeReturnState extends CommonResolverScopedState {
    $debounce: ComputedRef<number | undefined>;
    $lazy: ComputedRef<boolean | undefined>;
    $rewardEarly: ComputedRef<boolean | undefined>;
    $autoDirty: ComputedRef<boolean | undefined>;
    $clearExternalErrorsOnChange: ComputedRef<boolean | undefined>;
    $errors: ComputedRef<string[]>;
    $silentErrors: ComputedRef<string[]>;
    $tooltips: ComputedRef<string[]>;
    $haveAnyAsyncRule: ComputedRef<boolean>;
    $ready: ComputedRef<boolean>;
    $shortcuts: ToRefs<RegleShortcutDefinition['fields']>;
    $validating: Ref<boolean>;
    $dirty: Ref<boolean>;
    triggerPunishment: Ref<boolean>;
    $silentValue: ComputedRef<any>;
    processShortcuts: () => void;
  }

  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  let fieldScopes: EffectScope[] = [];

  let $unwatchState: WatchStopHandle;
  let $unwatchValid: WatchStopHandle;
  let $unwatchDirty: WatchStopHandle;
  let $unwatchAsync: WatchStopHandle;

  let $commit = () => {};

  function createReactiveRulesResult() {
    const declaredRules = rulesDef.value as RegleRuleDecl<any, any>;
    const storeResult = storage.checkRuleDeclEntry(path, declaredRules);

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
                fieldProperties: {
                  $dirty: scopeState.$dirty,
                  $error: scopeState.$error,
                  $invalid: scopeState.$invalid,
                  $pending: scopeState.$pending,
                  $valid: scopeState.$valid,
                },
                modifiers: {
                  $autoDirty: scopeState.$autoDirty,
                  $rewardEarly: scopeState.$rewardEarly,
                },
                customMessages,
                rule: ruleRef as any,
                ruleKey,
                state,
                path,
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
      scopeState.$dirty.value = storage.getDirtyState(path);
      if (scopeState.$dirty.value) {
        $commit();
      }
    }

    storage.addRuleDeclEntry(path, declaredRules);
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
    if (scopeState.$dirty.value) {
      storage.setDirtyEntry(path, scopeState.$dirty.value);
    }
    $unwatchState?.();
    $unwatchValid?.();
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

      const $lazy = computed<boolean | undefined>(() => {
        if ($localOptions.value.$lazy != null) {
          return $localOptions.value.$lazy;
        }
        return unref(options.lazy);
      });

      const $rewardEarly = computed<boolean | undefined>(() => {
        if ($autoDirty.value === true) {
          return false;
        }
        if ($localOptions.value.$rewardEarly != null) {
          return $localOptions.value.$rewardEarly;
        }
        return unref(options.rewardEarly);
      });

      const $clearExternalErrorsOnChange = computed<boolean | undefined>(() => {
        if ($localOptions.value.$clearExternalErrorsOnChange != null) {
          return $localOptions.value.$clearExternalErrorsOnChange;
        }
        return unref(options.clearExternalErrorsOnChange);
      });

      const $autoDirty = computed<boolean | undefined>(() => {
        if ($localOptions.value.$autoDirty != null) {
          return $localOptions.value.$autoDirty;
        }
        return unref(options.autoDirty);
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

      const $errors = computed<string[]>(() => {
        if ($error.value) {
          return extractRulesErrors({
            field: {
              $dirty: $dirty.value,
              $externalErrors: externalErrors?.value,
              $rules: $rules.value,
            },
          });
        }
        return [];
      });

      const $tooltips = computed<string[]>(() => {
        return extractRulesTooltips({
          field: {
            $rules: $rules.value,
          },
        });
      });

      const $silentErrors = computed<string[]>(() => {
        return extractRulesErrors({
          field: {
            $dirty: $dirty.value,
            $externalErrors: externalErrors?.value,
            $rules: $rules.value,
          },
          silent: true,
        });
      });

      const $ready = computed<boolean>(() => {
        return !($invalid.value || $pending.value);
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
        if (externalErrors?.value?.length) {
          return true;
        } else if (isEmpty($rules.value)) {
          return false;
        } else if (!$rewardEarly.value || ($rewardEarly.value && triggerPunishment.value)) {
          return Object.entries($rules.value).some(([key, ruleResult]) => {
            return !ruleResult.$valid;
          });
        }
        return false;
      });

      const $name = computed<string>(() => fieldName);

      const $valid = computed<boolean>(() => {
        if (externalErrors?.value?.length) {
          return false;
        } else if (isEmpty($rules.value)) {
          return true;
        } else if ($dirty.value && !isEmpty(state.value) && !$validating.value) {
          return Object.values($rules.value).every((ruleResult) => {
            return ruleResult.$valid && ruleResult.$active;
          });
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
                    $valid,
                    $errors,
                    $ready,
                    $silentErrors,
                    $anyDirty,
                    $tooltips,
                    $name,
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

      watch($valid, (value) => {
        if (value) {
          triggerPunishment.value = false;
        }
      });

      return {
        $error,
        $pending,
        $invalid,
        $valid,
        $debounce,
        $lazy,
        $errors,
        $ready,
        $silentErrors,
        $rewardEarly,
        $autoDirty,
        $clearExternalErrorsOnChange,
        $anyDirty,
        $name,
        $haveAnyAsyncRule,
        $shortcuts,
        $validating,
        $tooltips,
        $dirty,
        triggerPunishment,
        processShortcuts,
        $silentValue,
      } satisfies ScopeReturnState;
    })!;

    define$watchState();

    $unwatchDirty = watch(scopeState.$dirty, () => {
      storage.setDirtyEntry(path, scopeState.$dirty.value);
    });

    $unwatchValid = watch(scopeState.$valid, (valid) => {
      if (scopeState.$rewardEarly.value && valid) {
        scopeState.triggerPunishment.value = false;
      }
    });

    $unwatchAsync = watch(scopeState.$haveAnyAsyncRule, define$commit);
  }

  function define$watchState() {
    $unwatchState = watch(
      state,
      () => {
        if (scopeState.$autoDirty.value) {
          if (!scopeState.$dirty.value) {
            scopeState.$dirty.value = true;
          }
        }
        if (rulesDef.value instanceof Function) {
          createReactiveRulesResult();
        }
        if (scopeState.$autoDirty.value || (scopeState.$rewardEarly.value && scopeState.$error.value)) {
          $commit();
        }
        if (scopeState.$rewardEarly.value !== true && scopeState.$clearExternalErrorsOnChange.value) {
          $clearExternalErrors();
        }
      },
      { deep: $isArray ? true : isVueSuperiorOrEqualTo3dotFive ? 1 : true }
    );
  }

  function $commitHandler() {
    Object.values($rules.value).forEach((rule) => {
      rule.$validate();
    });
  }

  const $rules = ref({}) as Ref<Record<string, $InternalRegleRuleStatus>>;
  const $localOptions = ref({}) as Ref<FieldRegleBehaviourOptions>;

  createReactiveRulesResult();

  function $reset(): void {
    $clearExternalErrors();
    scopeState.$dirty.value = false;
    storage.setDirtyEntry(path, false);
    Object.entries($rules.value).forEach(([key, rule]) => {
      rule.$reset();
    });
    if (!scopeState.$lazy.value && scopeState.$autoDirty.value) {
      Object.values($rules.value).forEach((rule) => {
        return rule.$validate();
      });
    }
  }

  function $touch(runCommit = true, withConditions = false): void {
    if (!scopeState.$dirty.value) {
      scopeState.$dirty.value = true;
    }

    if (withConditions && runCommit) {
      if (scopeState.$autoDirty.value || (scopeState.$rewardEarly.value && scopeState.$error.value)) {
        $commit();
      }
    } else if (runCommit) {
      $commit();
    }
  }

  async function $validate(): Promise<$InternalRegleResult> {
    try {
      const data = state.value;
      scopeState.triggerPunishment.value = true;
      if (!scopeState.$dirty.value) {
        scopeState.$dirty.value = true;
      } else if (scopeState.$autoDirty.value && scopeState.$dirty.value && !scopeState.$pending.value) {
        return { result: !scopeState.$error.value, data };
      }

      if (isEmpty($rules.value)) {
        return { result: true, data };
      }
      const results = await Promise.allSettled(
        Object.entries($rules.value).map(([key, rule]) => {
          return rule.$validate();
        })
      );

      const validationResults = results.every((value) => {
        if (value.status === 'fulfilled') {
          return value.value === true;
        } else {
          return false;
        }
      });

      return { result: validationResults, data };
    } catch (e) {
      return { result: false, data: state.value };
    }
  }

  function $resetAll() {
    $unwatch();
    state.value = cloneDeep(initialState);
    $reset();
  }

  function $extractDirtyFields(filterNullishValues: boolean = true): unknown | null | { _null: true } {
    if (scopeState.$dirty.value) {
      return state.value;
    }
    if (filterNullishValues) {
      // Differenciate untouched empty values from dirty empty ones
      return { _null: true };
    }
    return null;
  }

  function $clearExternalErrors() {
    if (externalErrors?.value?.length) {
      externalErrors.value = [];
    }
  }

  if (!scopeState.$lazy.value && !scopeState.$dirty.value && scopeState.$autoDirty.value) {
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
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
    $resetAll,
    $extractDirtyFields,
    $clearExternalErrors,
  }) satisfies $InternalRegleFieldStatus;
}
