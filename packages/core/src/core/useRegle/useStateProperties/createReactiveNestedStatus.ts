import { ComputedRef, Ref, computed, effectScope, reactive, ref, toRef, toRefs, watch } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalReglePartialValidationTree,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
} from '../../../types';
import { isEmpty, isRefObject } from '../../../utils';
import { isCollectionRulesDef, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';

export function createReactiveNestedStatus({
  scopeRules,
  state,
  customMessages,
  path = '',
  rootRules,
}: {
  rootRules?: Ref<$InternalReglePartialValidationTree>;
  scopeRules: Ref<$InternalReglePartialValidationTree>;
  state: Ref<Record<string, any>>;
  customMessages: CustomRulesDeclarationTree;
  path?: string;
}): $InternalRegleStatus {
  type ScopeState = {
    $dirty: ComputedRef<boolean>;
    $anyDirty: ComputedRef<boolean>;
    $invalid: ComputedRef<boolean>;
    $valid: ComputedRef<boolean>;
    $error: ComputedRef<boolean>;
    $pending: ComputedRef<boolean>;
  };
  let scope = effectScope();
  let scopeState!: ScopeState;

  function createReactiveFieldsStatus() {
    $fields.value = Object.fromEntries(
      Object.entries(scopeRules.value)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(state.value, statePropKey);
            const statePropRulesRef = toRef(() => statePropRules);
            return [
              statePropKey,
              createReactiveChildrenStatus({
                state: stateRef,
                rulesDef: statePropRulesRef,
                customMessages,
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
    $watch();
  }

  const $fields = ref() as Ref<Record<string, $InternalRegleStatusType>>;
  createReactiveFieldsStatus();

  function $reset(): void {
    Object.entries($fields.value).forEach(([key, statusOrField]) => {
      statusOrField.$reset();
    });
  }

  function $touch(): void {
    Object.entries($fields.value).forEach(([key, statusOrField]) => {
      statusOrField.$touch();
    });
  }

  async function $validate(): Promise<boolean> {
    try {
      const results = await Promise.all(
        Object.entries($fields.value).map(([key, statusOrField]) => {
          return statusOrField.$validate();
        })
      );
      return results.every((value) => !!value);
    } catch (e) {
      return false;
    }
  }

  let $unwatchFields: (() => void) | undefined;

  if (rootRules) {
    $unwatchFields = watch(
      rootRules,
      () => {
        $unwatch();
        createReactiveFieldsStatus();
      },
      { deep: true }
    );
  }

  function $watch() {
    scopeState = scope.run(() => {
      const $dirty = computed<boolean>(() => {
        return Object.entries($fields.value).every(([key, statusOrField]) => {
          return statusOrField.$dirty;
        });
      });

      const $anyDirty = computed<boolean>(() => {
        return Object.entries($fields.value).some(([key, statusOrField]) => {
          return statusOrField.$dirty;
        });
      });

      const $invalid = computed<boolean>(() => {
        return Object.entries($fields.value).some(([key, statusOrField]) => {
          return statusOrField.$invalid;
        });
      });

      const $valid = computed(() => !$invalid.value);

      const $error = computed<boolean>(() => {
        return Object.entries($fields.value).some(([key, statusOrField]) => {
          return statusOrField.$error;
        });
      });

      const $pending = computed<boolean>(() => {
        return Object.entries($fields.value).some(([key, statusOrField]) => {
          return statusOrField.$pending;
        });
      });

      return {
        $dirty,
        $anyDirty,
        $invalid,
        $valid,
        $error,
        $pending,
      };
    }) as ScopeState;
  }

  function $unwatch() {
    if ($fields.value) {
      Object.entries($fields.value).forEach(([_, field]) => {
        field.$unwatch();
      });
    }
    if ($unwatchFields) {
      $unwatchFields();
    }
    scope.stop();
    scope = effectScope();
    scopeState = null as any; // cleanup
  }

  return reactive({
    ...scopeState,
    $fields,
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
  }) satisfies $InternalRegleStatus;
}

export function createReactiveChildrenStatus({
  state,
  rulesDef,
  customMessages,
  path,
}: {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalFormPropertyTypes>;
  customMessages: CustomRulesDeclarationTree;
  path: string;
}): $InternalRegleStatusType | null {
  if (isCollectionRulesDef(rulesDef)) {
    const { $each, ...otherFields } = toRefs(reactive(rulesDef.value));
    if (Array.isArray(state.value) && $each?.value) {
      const values = toRefs(state.value);
      return reactive({
        ...(!isEmpty(otherFields) &&
          createReactiveChildrenStatus({
            state,
            rulesDef: toRef(reactive(otherFields)) as any, // TODO
            customMessages,
            path,
          })),
        $each: values
          .map((value, index) => {
            return createReactiveChildrenStatus({
              state: value,
              rulesDef: $each as any,
              customMessages,
              path: `${path}.${index}`,
            });
          })
          .filter((f): f is $InternalRegleStatusType => !!f),
      }) as any;
    }

    return null;
  } else if (isNestedRulesDef(state, rulesDef) && isRefObject(state)) {
    return createReactiveNestedStatus({
      scopeRules: rulesDef,
      state,
      customMessages,
      path,
    });
  } else if (isValidatorRulesDef(rulesDef)) {
    return createReactiveFieldStatus({
      state,
      rulesDef,
      customMessages,
      path,
    });
  }

  return null;
}
