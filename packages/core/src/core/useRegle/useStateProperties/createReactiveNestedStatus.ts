import { RequiredDeep } from 'type-fest';
import {
  ComputedRef,
  EffectScope,
  Ref,
  effectScope,
  onScopeDispose,
  reactive,
  toRef,
  triggerRef,
  watch,
  computed,
} from 'vue';
import type {
  $InternalExternalRegleErrors,
  $InternalFormPropertyTypes,
  $InternalRegleErrors,
  $InternalReglePartialValidationTree,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  RegleBehaviourOptions,
  RegleExternalErrorTree,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { DeepMaybeRef } from '../../../types';
import { isRefObject } from '../../../utils';
import { RegleStorage } from '../../useStorage';
import { isCollectionRulesDef, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveCollectionStatus } from './createReactiveCollectionStatus';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';

interface CreateReactiveNestedStatus {
  rootRules?: Ref<$InternalReglePartialValidationTree>;
  scopeRules: Ref<$InternalReglePartialValidationTree>;
  state: Ref<Record<string, any>>;
  customMessages?: CustomRulesDeclarationTree;
  path?: string;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Readonly<Ref<RegleExternalErrorTree | undefined>>;
}

export function createReactiveNestedStatus({
  scopeRules,
  state,
  customMessages,
  path = '',
  rootRules,
  storage,
  options,
  externalErrors,
}: CreateReactiveNestedStatus): $InternalRegleStatus {
  type ScopeState = {
    $dirty: ComputedRef<boolean>;
    $anyDirty: ComputedRef<boolean>;
    $invalid: ComputedRef<boolean>;
    $valid: ComputedRef<boolean>;
    $error: ComputedRef<boolean>;
    $pending: ComputedRef<boolean>;
  };
  let scope: EffectScope;
  let scopeState!: ScopeState;
  let $unwatchFields: (() => void) | undefined;

  function createReactiveFieldsStatus(watch = true) {
    $fields.value = null as any;
    triggerRef($fields);
    $fields.value = Object.fromEntries(
      Object.entries(scopeRules.value)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(state.value, statePropKey);
            const statePropRulesRef = toRef(() => statePropRules);
            const $externalErrors = toRef(() => externalErrors.value?.[statePropKey]);
            return [
              statePropKey,
              createReactiveChildrenStatus({
                state: stateRef,
                rulesDef: statePropRulesRef,
                customMessages,
                path: path ? `${path}.${statePropKey}` : statePropKey,
                storage,
                options,
                externalErrors: $externalErrors,
              }),
            ];
          }
          return [];
        })
        .filter(
          (rule): rule is [string, $InternalRegleStatusType] => !!rule.length && rule[1] != null
        )
    );
    if (watch) {
      $watch();
    }
  }

  let $fields: Ref<Record<string, $InternalRegleStatusType>> = storage.getFieldsEntry(path);
  createReactiveFieldsStatus();

  function $reset(): void {
    createReactiveFieldsStatus(false);
    Object.entries($fields.value).forEach(([_, statusOrField]) => {
      statusOrField.$reset();
    });
    $watch();
  }

  function $touch(): void {
    Object.entries($fields.value).forEach(([_, statusOrField]) => {
      statusOrField.$touch();
    });
  }

  async function $validate(): Promise<boolean> {
    try {
      const results = await Promise.allSettled(
        Object.entries($fields.value).map(([_, statusOrField]) => {
          return statusOrField.$validate();
        })
      );
      return results.every((value) => {
        if (value.status === 'fulfilled') {
          return value.value;
        } else {
          return false;
        }
      });
    } catch (e) {
      return false;
    }
  }

  function $watch() {
    if (rootRules) {
      $unwatchFields = watch(
        rootRules,
        () => {
          $unwatch();
          createReactiveFieldsStatus();
        },
        { deep: true, flush: 'post' }
      );
    }
    scope = effectScope();
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

      const $valid = computed<boolean>(() => !$invalid.value);

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
      } satisfies ScopeState;
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
  }

  function $clearExternalErrors() {
    Object.entries($fields.value).forEach(([_, field]) => {
      field.$clearExternalErrors();
    });
  }

  return reactive({
    ...scopeState,
    $fields,
    $value: state,
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
    $clearExternalErrors,
  }) satisfies $InternalRegleStatus;
}

interface CreateReactiveChildrenStatus {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalFormPropertyTypes>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
  externalErrors: Readonly<Ref<$InternalExternalRegleErrors | undefined>>;
}

export function createReactiveChildrenStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
  externalErrors,
}: CreateReactiveChildrenStatus): $InternalRegleStatusType | null {
  if (isCollectionRulesDef(rulesDef)) {
    return createReactiveCollectionStatus({
      state,
      rulesDef,
      customMessages,
      path,
      storage,
      options,
      externalErrors,
    });
  } else if (isNestedRulesDef(state, rulesDef) && isRefObject(state)) {
    return createReactiveNestedStatus({
      scopeRules: rulesDef,
      state,
      customMessages,
      path,
      storage,
      options,
      externalErrors: externalErrors as Readonly<Ref<RegleExternalErrorTree | undefined>>,
    });
  } else if (isValidatorRulesDef(rulesDef)) {
    return createReactiveFieldStatus({
      state,
      rulesDef,
      customMessages,
      path,
      storage,
      options,
      externalErrors: externalErrors as Ref<string[] | undefined>,
    });
  }

  return null;
}
