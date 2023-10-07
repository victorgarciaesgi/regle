import { Ref, computed, reactive, ref, toRef, toRefs, watch } from 'vue';
import { isEmpty } from '../../../utils';
import type {
  CustomRulesDeclarationTree,
  PossibleRegleFieldStatus,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleStatus,
  RegleSoftRuleStatus,
  RegleStatus,
} from '../../../types';
import { isCollectionRulesDef, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';

export function createReactiveNestedStatus(
  scopeRules: Ref<ReglePartialValidationTree<Record<string, any>>>,
  state: Ref<Record<string, any>>,
  customRules: () => Partial<CustomRulesDeclarationTree>,
  path: string
): RegleStatus<Record<string, any>, ReglePartialValidationTree<Record<string, any>>> {
  const $fields = reactive(
    Object.fromEntries(
      Object.entries(scopeRules.value)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(state.value, statePropKey);
            const statePropRulesRef = toRef(() => statePropRules);
            return [
              statePropKey,
              createReactiveFieldStatus(
                stateRef,
                statePropRulesRef,
                customRules,
                path ? `${path}.${statePropKey}` : statePropKey
              ),
            ];
          }
          return [];
        })
        .filter(
          (rule): rule is [string, PossibleRegleFieldStatus] => !!rule.length && rule[1] != null
        )
    )
  );

  watch(scopeRules, () => {
    console.log(scopeRules);
  });

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

export function createReactiveFieldStatus(
  state: Ref<unknown>,
  rulesDef: Ref<RegleFormPropertyType<any, any>>,
  customRules: () => Partial<CustomRulesDeclarationTree>,
  path: string
): PossibleRegleFieldStatus | null {
  if (isCollectionRulesDef(rulesDef)) {
    const { $each, ...otherFields } = toRefs(reactive(rulesDef.value));
    if (Array.isArray(state.value) && $each?.value) {
      const values = toRefs(state.value);
      return reactive({
        ...(!isEmpty(otherFields) &&
          createReactiveFieldStatus(state, toRef(reactive(otherFields)), customRules, path)),
        $each: values
          .map((value, index) => {
            return createReactiveFieldStatus(value, $each as any, customRules, `${path}.${index}`);
          })
          .filter((f): f is PossibleRegleFieldStatus => !!f),
      }) as any;
    }

    return null;
  } else if (isNestedRulesDef(state, rulesDef)) {
    return createReactiveNestedStatus(
      rulesDef,
      state as Ref<Record<string, any>>,
      customRules,
      path
    );
  } else if (isValidatorRulesDef(rulesDef)) {
    const customMessages = customRules();

    const $dirty = ref(false);
    const $anyDirty = computed<boolean>(() => $dirty.value);

    const $rules = reactive(
      Object.fromEntries(
        Object.entries(rulesDef.value)
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
                }),
              ];
            }
            return [];
          })
          .filter((ruleDef): ruleDef is [string, RegleSoftRuleStatus] => !!ruleDef.length)
      )
    );

    const $error = computed<boolean>(() => {
      return $invalid.value && !$pending.value && $dirty.value;
    });

    const $pending = computed<boolean>(() => {
      return Object.entries($rules).some(([key, rule]) => {
        return rule.$pending;
      });
    });

    const $invalid = computed<boolean>(() => {
      return Object.entries($rules).some(([key, ruleResult]) => {
        return !ruleResult.$valid;
      });
    });

    const $valid = computed<boolean>(() => !$invalid.value);

    function $reset(): void {
      $dirty.value = false;
    }

    function $touch(): void {
      $dirty.value = true;
      $validate();
    }

    watch(state, () => {
      if (!$dirty.value) {
        $dirty.value = true;
      }
    });

    async function $validate(): Promise<boolean> {
      try {
        const results = await Promise.all(
          Object.entries($rules).map(([key, rule]) => {
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
      $invalid,
      $error,
      $pending,
      $valid,
      $value: state,
      $rules: $rules as Record<string, RegleRuleStatus>,
      $reset,
      $touch,
      $validate,
    }) satisfies PossibleRegleFieldStatus;
  }

  return null;
}
