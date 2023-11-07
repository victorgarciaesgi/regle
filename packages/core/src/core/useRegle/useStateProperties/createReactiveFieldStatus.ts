import { ComputedRef, Ref, computed, effectScope, reactive, ref, toRef, unref, watch } from 'vue';
import type {
  $InternalExternalRegleErrors,
  $InternalFormPropertyTypes,
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  CustomRulesDeclarationTree,
  RegleRuleDecl,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { RegleStorage } from '../../useStorage';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';

interface CreateReactiveFieldStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalFormPropertyTypes>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Readonly<Ref<string[] | undefined>>;
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
  externalErrors,
}: CreateReactiveFieldStatusArgs): $InternalRegleFieldStatus {
  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  const $dirty = ref(false);
  const $anyDirty = computed<boolean>(() => $dirty.value);

  const triggerPunishment = ref(false);

  const $externalErrors = ref<string[] | undefined>([]);

  function collectExternalErrors() {
    if (externalErrors.value) {
      $externalErrors.value = externalErrors.value;
    }
  }
  collectExternalErrors();

  const $unwatchExternalErrors = watch(externalErrors, collectExternalErrors);

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
    $externalErrors.value = [];
    console.log($externalErrors.value);
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
    $unwatchExternalErrors();
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
      } satisfies ScopeReturnState;
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
    $externalErrors.value = [];
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

  function $clearExternalErrors() {
    $externalErrors.value = [];
  }

  return reactive({
    $dirty,
    $anyDirty,
    $invalid: scopeState.$invalid,
    $error: scopeState.$error,
    $pending: scopeState.$pending,
    $valid: scopeState.$valid,
    $externalErrors,
    $value: state,
    $rules: $rules,
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
    $clearExternalErrors,
  }) satisfies $InternalRegleFieldStatus;
}
