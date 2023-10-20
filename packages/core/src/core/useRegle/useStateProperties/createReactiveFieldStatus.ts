import {
  ComputedRef,
  Ref,
  computed,
  effectScope,
  reactive,
  ref,
  toRef,
  unref,
  watch,
  watchEffect,
} from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  CustomRulesDeclarationTree,
  RegleBehaviourOptions,
  RegleRuleDecl,
} from '../../../types';
import { RegleStorage } from '../../useStorage';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';
import { RequiredDeep } from 'type-fest';
import { DeepMaybeRef } from '../../../types';

interface CreateReactiveFieldStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalFormPropertyTypes>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
}

type ScopeReturnState = {
  $error: ComputedRef<boolean>;
  $pending: ComputedRef<boolean>;
  $invalid: ComputedRef<boolean>;
  $valid: ComputedRef<boolean>;
};

export function createReactiveFieldStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
}: CreateReactiveFieldStatusArgs): $InternalRegleFieldStatus {
  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  const $dirty = ref(false);
  const $anyDirty = computed<boolean>(() => $dirty.value);

  const triggerPunishment = ref(false);

  function createReactiveRulesResult() {
    const declaredRules = rulesDef.value as RegleRuleDecl<any, any>;
    const storeResult = storage.checkRuleDeclEntry(path, declaredRules);

    $rules.value = Object.fromEntries(
      Object.entries(declaredRules)
        .map(([ruleKey, rule]) => {
          if (rule) {
            const ruleRef = toRef(() => rule);
            return [
              ruleKey,
              createReactiveRuleStatus({
                $dirty,
                customMessages,
                rule: ruleRef,
                ruleKey,
                state,
                path,
                storage,
                options,
              }),
            ];
          }
          return [];
        })
        .filter((ruleDef): ruleDef is [string, $InternalRegleRuleStatus] => !!ruleDef.length)
    );

    $watch();

    if (storeResult?.valid != null) {
      $dirty.value = storage.getDirtyState(path);
      if ($dirty.value) {
        $commit();
      }
    }

    storage.addRuleDeclEntry(path, declaredRules);
  }

  const $unwatchDirty = watch($dirty, () => {
    storage.setDirtyEntry(path, $dirty.value);
  });

  const $unwatchState = watch(state, () => {
    if (unref(options.autoDirty)) {
      if (!$dirty.value) {
        $dirty.value = true;
      }
    }
    if (!unref(options.lazy)) {
      $commit();
    }
  });

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
    scope.stop();
    scope = effectScope();
  }

  function $watch() {
    scopeState = scope.run(() => {
      const $error = computed<boolean>(() => {
        return $invalid.value && !$pending.value && $dirty.value;
      });

      const $pending = computed<boolean>(() => {
        if (triggerPunishment.value || !unref(options.rewardEarly)) {
          return Object.entries($rules.value).some(([key, ruleResult]) => {
            return ruleResult.$pending;
          });
        }
        return false;
      });

      const $invalid = computed<boolean>(() => {
        if (triggerPunishment.value || !unref(options.rewardEarly)) {
          return Object.entries($rules.value).some(([key, ruleResult]) => {
            return !ruleResult.$valid;
          });
        }
        return false;
      });

      const $valid = computed<boolean>(() => {
        if (unref(options.rewardEarly)) {
          return Object.entries($rules.value).every(([key, ruleResult]) => {
            return ruleResult.$valid;
          });
        } else {
          return !$invalid.value;
        }
      });

      return {
        $error,
        $pending,
        $invalid,
        $valid,
      };
    }) as ScopeReturnState;
  }

  const $rules = ref() as Ref<Record<string, $InternalRegleRuleStatus>>;
  createReactiveRulesResult();

  const $unwatchValid = watch(scopeState.$valid, (valid) => {
    if (unref(options.rewardEarly) && valid) {
      triggerPunishment.value = false;
    }
  });

  function $reset(): void {
    $dirty.value = false;
  }

  function $touch(): void {
    $dirty.value = true;
  }

  function $commit(): void {
    Object.entries($rules.value).map(([key, rule]) => {
      return rule.$validate();
    });
  }

  async function $validate(): Promise<boolean> {
    try {
      triggerPunishment.value = true;
      const results = await Promise.all(
        Object.entries($rules.value).map(([key, rule]) => {
          return rule.$validate();
        })
      );
      return results.every((value) => !!value);
    } catch (e) {
      return false;
    }
  }

  return reactive({
    $dirty,
    $anyDirty,
    $invalid: scopeState.$invalid,
    $error: scopeState.$error,
    $pending: scopeState.$pending,
    $valid: scopeState.$valid,
    $value: state,
    $rules: $rules,
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
  }) satisfies $InternalRegleFieldStatus;
}
