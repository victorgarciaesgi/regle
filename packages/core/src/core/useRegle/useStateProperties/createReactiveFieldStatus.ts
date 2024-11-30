import type { ComputedRef, Ref, ToRefs, WatchStopHandle } from 'vue';
import {
  computed,
  effectScope,
  reactive,
  ref,
  toRef,
  toRefs,
  unref,
  watch,
  watchEffect,
} from 'vue';
import type {
  $InternalRegleFieldStatus,
  $InternalRegleRuleDecl,
  $InternalRegleRuleStatus,
  CustomRulesDeclarationTree,
  FieldRegleBehaviourOptions,
  RegleRuleDecl,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { debounce, isEmpty, isVueSuperiorOrEqualTo3dotFive, resetFieldValue } from '../../../utils';
import type { RegleStorage } from '../../useStorage';
import { extractRulesErrors } from '../useErrors';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';

interface CreateReactiveFieldStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleRuleDecl>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  fieldName: string;
  index?: number;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Readonly<Ref<string[] | undefined>>;
  onUnwatch?: () => void;
  $isArray?: boolean;
  initialState: unknown | undefined;
  shortcuts: RegleShortcutDefinition | undefined;
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
  type ScopeReturnState = {
    $error: ComputedRef<boolean>;
    $errors: ComputedRef<string[]>;
    $silentErrors: ComputedRef<string[]>;
    $pending: ComputedRef<boolean>;
    $invalid: ComputedRef<boolean>;
    $valid: ComputedRef<boolean>;
    $debounce: ComputedRef<number | undefined>;
    $lazy: ComputedRef<boolean | undefined>;
    $rewardEarly: ComputedRef<boolean | undefined>;
    $autoDirty: ComputedRef<boolean | undefined>;
    $anyDirty: ComputedRef<boolean>;
    haveAnyAsyncRule: ComputedRef<boolean>;
    $ready: ComputedRef<boolean>;
    $name: ComputedRef<string>;
    $shortcuts: ToRefs<RegleShortcutDefinition['fields']>;
  };

  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  const $dirty = ref(false);

  const triggerPunishment = ref(false);

  const $externalErrors = ref<string[]>([]);

  let $unwatchState: WatchStopHandle;
  let $unwatchValid: WatchStopHandle;
  let $unwatchExternalErrors: WatchStopHandle;
  let $unwatchDirty: WatchStopHandle;
  let $unwatchAsync: WatchStopHandle;

  let $commit = () => {};

  function collectExternalErrors() {
    $externalErrors.value = externalErrors.value ?? [];
  }
  collectExternalErrors();

  function createReactiveRulesResult() {
    const declaredRules = rulesDef.value as RegleRuleDecl<any, any>;
    const storeResult = storage.checkRuleDeclEntry(path, declaredRules);

    $localOptions.value = Object.fromEntries(
      Object.entries(declaredRules).filter(([ruleKey]) => ruleKey.startsWith('$'))
    );

    $rules.value = Object.fromEntries(
      Object.entries(rulesDef.value)
        .filter(([ruleKey]) => !ruleKey.startsWith('$'))
        .map(([ruleKey, rule]) => {
          if (rule) {
            const ruleRef = toRef(() => rule);
            return [
              ruleKey,
              createReactiveRuleStatus({
                $dirty,
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

    $watch();

    define$commit();

    if (storeResult?.valid != null) {
      $dirty.value = storage.getDirtyState(path);
      if ($dirty.value) {
        $commit();
      }
    }

    storage.addRuleDeclEntry(path, declaredRules);
  }

  function define$commit() {
    $commit = scopeState.$debounce.value
      ? debounce(
          $commitHandler,
          (scopeState.$debounce.value ?? scopeState.haveAnyAsyncRule) ? 100 : 0
        )
      : $commitHandler;
  }

  function $unwatch() {
    if ($rules.value) {
      Object.entries($rules.value).forEach(([_, rule]) => {
        rule.$unwatch();
      });
    }
    $unwatchDirty();
    if ($dirty.value) {
      storage.setDirtyEntry(path, $dirty.value);
    }
    $unwatchState();
    $unwatchValid();
    $unwatchExternalErrors();
    scope.stop();
    scope = effectScope();
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
        if ($localOptions.value.$rewardEarly != null) {
          return $localOptions.value.$rewardEarly;
        }
        return unref(options.rewardEarly);
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

      const $error = computed<boolean>(() => {
        return $invalid.value && !$pending.value && $dirty.value;
      });

      const $errors = computed<string[]>(() => {
        if ($error.value) {
          return extractRulesErrors({
            field: {
              $dirty: $dirty.value,
              $externalErrors: $externalErrors.value,
              $rules: $rules.value,
            },
          });
        }
        return [];
      });

      const $silentErrors = computed<string[]>(() => {
        return extractRulesErrors({
          field: {
            $dirty: $dirty.value,
            $externalErrors: $externalErrors.value,
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
        if ($externalErrors.value?.length) {
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
        if (isEmpty($rules.value)) {
          return !$invalid.value;
        } else if ($dirty.value && !isEmpty(state.value) && !$validating.value) {
          if ($externalErrors.value?.length) {
            return false;
          } else if ($rewardEarly.value) {
            return Object.entries($rules.value).every(([key, ruleResult]) => {
              return ruleResult.$valid;
            });
          } else {
            return !$invalid.value;
          }
        }
        return false;
      });

      const haveAnyAsyncRule = computed(() => {
        return Object.entries($rules.value).some(([key, ruleResult]) => {
          return ruleResult._haveAsync;
        });
      });

      function processShortcuts() {
        if (shortcuts?.fields) {
          Object.entries(shortcuts.fields).forEach(([key, value]) => {
            const scope = effectScope();

            $shortcuts[key] = scope.run(() => {
              const result = ref();

              watchEffect(() => {
                result.value = value({
                  $dirty: $dirty.value,
                  $externalErrors: $externalErrors.value,
                  $value: state,
                  $rules: $rules.value,
                  $error: $error.value,
                  $pending: $pending.value,
                  $invalid: $invalid.value,
                  $valid: $valid.value,
                  $errors: $errors.value,
                  $ready: $ready.value,
                  $silentErrors: $silentErrors.value,
                  $anyDirty: $anyDirty.value,
                  $name: $name.value,
                });
              });
              return result;
            })!;
          });
        }
      }

      const $shortcuts: ToRefs<Record<string, Readonly<Ref<any>>>> = {};
      processShortcuts();

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
        $anyDirty,
        $name,
        haveAnyAsyncRule,
        $shortcuts,
      } satisfies ScopeReturnState;
    })!;

    $unwatchExternalErrors = watch(externalErrors, collectExternalErrors);
    $unwatchState = watch(
      state,
      () => {
        if (scopeState.$autoDirty.value) {
          if (!$dirty.value) {
            $dirty.value = true;
          }
        }
        if (rulesDef.value instanceof Function) {
          createReactiveRulesResult();
        }
        $commit();
        if (scopeState.$rewardEarly.value !== true) {
          $clearExternalErrors();
        }
      },
      { deep: $isArray ? true : isVueSuperiorOrEqualTo3dotFive ? 1 : true }
    );

    $unwatchDirty = watch($dirty, () => {
      storage.setDirtyEntry(path, $dirty.value);
    });

    $unwatchValid = watch(scopeState.$valid, (valid) => {
      if (scopeState.$rewardEarly.value && valid) {
        triggerPunishment.value = false;
      }
    });

    $unwatchAsync = watch(scopeState.haveAnyAsyncRule, define$commit);
  }

  function $commitHandler() {
    Object.entries($rules.value).forEach(([key, rule]) => {
      rule.$validate();
    });
  }

  const $rules = ref() as Ref<Record<string, $InternalRegleRuleStatus>>;
  const $localOptions = ref() as Ref<FieldRegleBehaviourOptions>;

  createReactiveRulesResult();

  function $reset(): void {
    $dirty.value = false;
    $externalErrors.value = [];
    Object.entries($rules.value).forEach(([key, rule]) => {
      rule.$reset();
    });
    if (!scopeState.$lazy.value) {
      Object.entries($rules.value).map(([key, rule]) => {
        return rule.$validate();
      });
    }
  }

  function $touch(): void {
    if (!$dirty.value) {
      $dirty.value = true;

      $commit();
    }
  }

  const $validate = scopeState.$debounce.value
    ? debounce($validateHandler, scopeState.$debounce.value ?? 0)
    : $validateHandler;

  async function $validateHandler(): Promise<boolean> {
    try {
      triggerPunishment.value = true;
      if (scopeState.$autoDirty.value && $dirty.value && !scopeState.$pending.value) {
        return !scopeState.$error.value;
      } else {
        if (scopeState.$autoDirty.value === false && !$dirty.value) {
          $dirty.value = true;
        }
        const promises = Object.entries($rules.value).map(([key, rule]) => {
          return rule.$validate();
        });
        const results = await Promise.allSettled(promises);

        return results.every((value) => {
          if (value.status === 'fulfilled') {
            return value.value;
          } else {
            return false;
          }
        });
      }
    } catch (e) {
      return false;
    }
  }

  function $resetAll() {
    $unwatch();
    state.value = resetFieldValue(state, initialState);
    $reset();
  }

  function $extractDirtyFields(filterNullishValues: boolean = true): any | null {
    if ($dirty.value) {
      return state.value;
    }
    return null;
  }

  function $clearExternalErrors() {
    $externalErrors.value = [];
  }

  if (!scopeState.$lazy.value) {
    $validateHandler();
  }

  const {
    $anyDirty,
    $error,
    $errors,
    $invalid,
    $name,
    $pending,
    $ready,
    $silentErrors,
    $valid,
    $shortcuts,
  } = scopeState;

  return reactive({
    $dirty,
    $error,
    $errors,
    $valid,
    $invalid,
    $pending,
    $silentErrors,
    $anyDirty,
    $ready,
    $name,
    $externalErrors,
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
