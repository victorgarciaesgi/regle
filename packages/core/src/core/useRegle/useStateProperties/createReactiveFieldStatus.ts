import type { ComputedRef, Ref, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, unref, watch } from 'vue';
import type {
  $InternalRegleFieldStatus,
  $InternalRegleRuleDecl,
  $InternalRegleRuleStatus,
  CustomRulesDeclarationTree,
  FieldRegleBehaviourOptions,
  RegleRuleDecl,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { debounce, isEmpty, isVueSuperiorOrEqualTo3dotFive } from '../../../utils';
import type { RegleStorage } from '../../useStorage';
import { extractRulesErrors } from '../useErrors';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';

interface CreateReactiveFieldStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleRuleDecl>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  index?: number;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Readonly<Ref<string[] | undefined>>;
  onUnwatch?: () => void;
  $isArray?: boolean;
}

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
};

export function createReactiveFieldStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
  externalErrors,
  index,
  onUnwatch,
  $isArray,
}: CreateReactiveFieldStatusArgs): $InternalRegleFieldStatus {
  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  const $dirty = ref(false);

  const triggerPunishment = ref(false);

  const $externalErrors = ref<string[] | undefined>([]);

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
        return !$invalid.value && !$pending.value;
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
        } else if (!$rewardEarly.value || ($rewardEarly.value && triggerPunishment.value)) {
          return Object.entries($rules.value).some(([key, ruleResult]) => {
            return !ruleResult.$valid;
          });
        }
        return false;
      });

      const $valid = computed<boolean>(() => {
        if ($dirty.value && !isEmpty(state.value) && !$validating.value) {
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
        haveAnyAsyncRule,
      } satisfies ScopeReturnState;
    }) as ScopeReturnState;

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
        if (!scopeState.$rewardEarly.value !== false) {
          // $clearExternalErrors();
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
      if (!scopeState.$rewardEarly.value !== false) {
        // $clearExternalErrors();
      }
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

  return reactive({
    $dirty,
    ...scopeState,
    $externalErrors,
    $value: state,
    $rules: $rules,
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
    $extractDirtyFields,
    $clearExternalErrors,
  }) satisfies $InternalRegleFieldStatus;
}
