import { ComputedRef, Ref, computed, effectScope, reactive, ref, toRef, toRefs, watch } from 'vue';
import { isEmpty } from '../../../utils';
import type {
  CustomRulesDeclarationTree,
  PossibleFormPropertyTypes,
  $InternalRegleStatusType,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleStatus,
  $InternalRegleRuleStatus,
  RegleStatus,
} from '../../../types';
import { isCollectionRulesDef, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';
import { useStorage } from '../../useStorage';

export function createReactiveNestedStatus({
  scopeRules,
  state,
  customRules,
  path = '',
  rootRules,
}: {
  rootRules: Ref<ReglePartialValidationTree<Record<string, any>>>;
  scopeRules: Ref<ReglePartialValidationTree<Record<string, any>>>;
  state: Ref<Record<string, any>>;
  customRules: () => Partial<CustomRulesDeclarationTree>;
  path?: string;
}): RegleStatus<Record<string, any>, ReglePartialValidationTree<Record<string, any>>> {
  const $fields = ref(createReactiveFieldsStatus());

  function createReactiveFieldsStatus() {
    return Object.fromEntries(
      Object.entries(scopeRules.value)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(state.value, statePropKey);
            const statePropRulesRef = toRef(() => statePropRules);
            return [
              statePropKey,
              createReactiveFieldStatus({
                state: stateRef,
                rulesDef: statePropRulesRef,
                rootRules,
                customRules,
                path: path ? `${path}.${statePropKey}` : statePropKey,
              }),
            ];
          }
          return [];
        })
        .filter(
          (rule): rule is [string, $InternalRegleStatusType] => !!rule.length && rule[1] != null
        )
    );
  }

  watch(
    rootRules,
    () => {
      $fields.value = createReactiveFieldsStatus();
    },
    { deep: true }
  );

  const $dirty = computed<boolean>(() => {
    return Object.entries($fields).every(([key, statusOrField]) => {
      return statusOrField.$dirty;
    });
  });

  const $anyDirty = computed<boolean>(() => {
    return Object.entries($fields).some(([key, statusOrField]) => {
      return statusOrField.$dirty;
    });
  });

  const $invalid = computed<boolean>(() => {
    return Object.entries($fields).some(([key, statusOrField]) => {
      return statusOrField.$invalid;
    });
  });

  const $valid = computed(() => !$invalid.value);

  const $error = computed<boolean>(() => {
    return Object.entries($fields).some(([key, statusOrField]) => {
      return statusOrField.$error;
    });
  });

  const $pending = computed<boolean>(() => {
    return Object.entries($fields).some(([key, statusOrField]) => {
      return statusOrField.$pending;
    });
  });

  function $reset(): void {
    Object.entries($fields).forEach(([key, statusOrField]) => {
      statusOrField.$reset();
    });
  }

  function $touch(): void {
    Object.entries($fields).forEach(([key, statusOrField]) => {
      statusOrField.$touch();
    });
  }

  async function $validate(): Promise<boolean> {
    try {
      const results = await Promise.all(
        Object.entries($fields).map(([key, statusOrField]) => {
          return statusOrField.$validate();
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
    $invalid,
    $valid,
    $error,
    $pending,
    $fields,
    $reset,
    $touch,
    $validate,
  }) satisfies RegleStatus<Record<string, any>, ReglePartialValidationTree<Record<string, any>>>;
}

export function createReactiveFieldStatus({
  state,
  rulesDef,
  customRules,
  rootRules,
  path,
}: {
  state: Ref<unknown>;
  rulesDef: Ref<PossibleFormPropertyTypes>;
  rootRules: Ref<ReglePartialValidationTree<Record<string, any>>>;
  customRules: () => Partial<CustomRulesDeclarationTree>;
  path: string;
}): $InternalRegleStatusType | null {
  if (isCollectionRulesDef(rulesDef)) {
    const { $each, ...otherFields } = toRefs(reactive(rulesDef.value));
    if (Array.isArray(state.value) && $each?.value) {
      const values = toRefs(state.value);
      return reactive({
        ...(!isEmpty(otherFields) &&
          createReactiveFieldStatus({
            state,
            rulesDef: toRef(reactive(otherFields)),
            rootRules,
            customRules,
            path,
          })),
        $each: values
          .map((value, index) => {
            return createReactiveFieldStatus({
              state: value,
              rulesDef: $each as any,
              rootRules,
              customRules,
              path: `${path}.${index}`,
            });
          })
          .filter((f): f is $InternalRegleStatusType => !!f),
      }) as any;
    }

    return null;
  } else if (isNestedRulesDef(state, rulesDef)) {
    return createReactiveNestedStatus({
      scopeRules: rulesDef,
      state: state as Ref<Record<string, any>>,
      rootRules,
      customRules,
      path,
    });
  } else if (isValidatorRulesDef(rulesDef)) {
    const customMessages = customRules();

    type ScopeReturnState = {
      $error: ComputedRef<boolean>;
      $pending: ComputedRef<boolean>;
      $invalid: ComputedRef<boolean>;
      $valid: ComputedRef<boolean>;
    };
    const scope = effectScope();
    let scopeState!: ScopeReturnState;

    const $dirty = ref(false);
    const $anyDirty = computed<boolean>(() => $dirty.value);

    const { addEntry, checkEntry, setDirtyEntry, getDirtyState } = useStorage();

    function createReactiveRulesResult() {
      const declaredRules = rulesDef.value as RegleRuleDecl<any, any>;
      const storeResult = checkEntry(path, declaredRules);

      const newRules = Object.fromEntries(
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
      $rules.value = newRules;

      if (storeResult?.valid != null) {
        $dirty.value = getDirtyState(path);
        if (storeResult.valid === false) {
          $validate();
        }
      }

      addEntry(path, {
        rulesDef: declaredRules,
      });

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
          console.log('Computed run');
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

    const $unwatchDirty = watch($dirty, () => {
      setDirtyEntry(path, $dirty.value);
    });

    const $unwatchState = watch(state, () => {
      if (!$dirty.value) {
        $dirty.value = true;
      }
    });

    function $unwatch() {
      $unwatchDirty();
      $unwatchState();
      scope.stop();
    }

    const $rules = ref() as Ref<Record<string, $InternalRegleRuleStatus<any, any>>>;
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
    }) satisfies $InternalRegleStatusType;
  }

  return null;
}
