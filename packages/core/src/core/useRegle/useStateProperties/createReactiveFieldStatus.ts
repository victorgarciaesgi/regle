import { ComputedRef, Ref, computed, effectScope, reactive, ref, toRef, watch } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  CustomRulesDeclarationTree,
  RegleRuleDecl,
} from '../../../types';
import { useStorage } from '../../useStorage';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';

interface CreateReactiveFieldStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalFormPropertyTypes>;
  customMessages: CustomRulesDeclarationTree;
  path: string;
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
}: CreateReactiveFieldStatusArgs): $InternalRegleFieldStatus {
  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  const $dirty = ref(false);
  const $anyDirty = computed<boolean>(() => $dirty.value);

  const { addEntry, checkEntry, setDirtyEntry, getDirtyState } = useStorage();

  function createReactiveRulesResult() {
    const declaredRules = rulesDef.value as RegleRuleDecl<any, any>;
    const storeResult = checkEntry(path, declaredRules);

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
              }),
            ];
          }
          return [];
        })
        .filter((ruleDef): ruleDef is [string, $InternalRegleRuleStatus] => !!ruleDef.length)
    );

    $watch();

    if (storeResult?.valid != null) {
      $dirty.value = getDirtyState(path);
    }

    addEntry(path, {
      rulesDef: declaredRules,
    });
  }

  const $unwatchDirty = watch($dirty, () => {
    setDirtyEntry(path, $dirty.value);
  });

  const $unwatchState = watch(state, () => {
    if (!$dirty.value) {
      $dirty.value = true;
    }
    $validate();
  });

  function $unwatch() {
    if ($rules.value) {
      Object.entries($rules.value).forEach(([_, rule]) => {
        rule.$unwatch();
      });
    }
    $unwatchDirty();
    $unwatchState();
    scope.stop();
    scope = effectScope();
    scopeState = null as any; // cleanup
  }

  function $watch() {
    scopeState = scope.run(() => {
      const $error = computed<boolean>(() => {
        return $invalid.value && !$pending.value && $dirty.value;
      });

      const $pending = computed<boolean>(() => {
        return Object.entries($rules.value).some(([key, rule]) => {
          return rule.$pending;
        });
      });

      const $invalid = computed<boolean>(() => {
        return Object.entries($rules.value).some(([key, ruleResult]) => {
          return !ruleResult.$valid;
        });
      });

      const $valid = computed<boolean>(() => !$invalid.value);

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

  function $reset(): void {
    $dirty.value = false;
  }

  function $touch(): void {
    $dirty.value = true;
    $validate();
  }

  async function $validate(): Promise<boolean> {
    try {
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
