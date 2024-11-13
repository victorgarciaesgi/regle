import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, EffectScope, Ref, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, triggerRef, unref, watch } from 'vue';
import type {
  DeepMaybeRef,
  CustomRulesDeclarationTree,
  $InternalExternalRegleErrors,
  $InternalFormPropertyTypes,
  $InternalReglePartialValidationTree,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  MaybeGetter,
  RegleBehaviourOptions,
  RegleExternalErrorTree,
  RegleValidationGroupEntry,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { mergeArrayGroupProperties, mergeBooleanGroupProperties } from '../../../types';
import { isRefObject, unwrapGetter } from '../../../utils';
import type { RegleStorage } from '../../useStorage';
import { isCollectionRulesDef, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveCollectionStatus } from './createReactiveCollectionStatus';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';

interface CreateReactiveNestedStatus {
  rootRules?: Ref<$InternalReglePartialValidationTree>;
  scopeRules: Ref<MaybeGetter<$InternalReglePartialValidationTree>>;
  state: Ref<Record<string, any>>;
  customMessages?: CustomRulesDeclarationTree;
  path?: string;
  index?: number;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Readonly<Ref<RegleExternalErrorTree | undefined>>;
  validationGroups?:
    | ((rules: {
        [x: string]: $InternalRegleStatusType;
      }) => Record<string, RegleValidationGroupEntry[]>)
    | undefined;
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
  validationGroups,
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
  let $unwatchFields: WatchStopHandle;
  let $unwatchState: WatchStopHandle;
  let $unwatchGroups: WatchStopHandle;

  function createReactiveFieldsStatus(watch = true) {
    $fields.value = null!;
    triggerRef($fields);

    const unwrappedScopedRules = unwrapGetter(scopeRules.value, state.value);
    const scopedRulesStatus = Object.fromEntries(
      Object.entries(unwrappedScopedRules)
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

    const externalRulesStatus = Object.fromEntries(
      Object.entries(unref(externalErrors) ?? {})
        .filter(([key]) => !(key in unwrappedScopedRules))
        .map(([key, errors]) => {
          if (errors) {
            const statePropRulesRef = toRef(() => ({}));
            const $externalErrors = toRef(() => errors);
            return [
              key,
              createReactiveChildrenStatus({
                state: ref(undefined),
                rulesDef: statePropRulesRef,
                customMessages,
                path: path ? `${path}.${key}` : key,
                storage,
                options,
                externalErrors: $externalErrors,
              }),
            ];
          }
          return [];
        })
    );

    const groups = Object.fromEntries(
      Object.entries(validationGroups?.(scopedRulesStatus) ?? {}).map(([key, entries]) => {
        if (entries.length) {
          return [
            key,
            {
              ...Object.fromEntries(
                (['$invalid', '$error', '$pending', '$dirty', '$valid'] as const).map(
                  (property) => [
                    property,
                    mergeBooleanGroupProperties(
                      toRef(() => entries),
                      property
                    ),
                  ]
                )
              ),
              ...Object.fromEntries(
                (['$errors', '$silentErrors'] as const).map((property) => [
                  property,
                  mergeArrayGroupProperties(
                    toRef(() => entries),
                    property
                  ),
                ])
              ),
            },
          ];
        }
        return [];
      })
    );

    $fields.value = { ...scopedRulesStatus, ...externalRulesStatus, ...groups };
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
    if (scopeRules.value instanceof Function) {
      $unwatchState = watch(
        state,
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
    $unwatchFields?.();
    $unwatchState?.();
    $unwatchGroups?.();
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
  rulesDef: Ref<MaybeGetter<$InternalFormPropertyTypes, any>>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  index?: number;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
  externalErrors: Readonly<Ref<$InternalExternalRegleErrors | undefined>>;
  onUnwatch?: () => void;
}

export function createReactiveChildrenStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
  externalErrors,
  index,
  onUnwatch,
}: CreateReactiveChildrenStatus): $InternalRegleStatusType | null {
  if (isCollectionRulesDef(rulesDef, state)) {
    return createReactiveCollectionStatus({
      state,
      rulesDef,
      customMessages,
      path,
      storage,
      options,
      index,
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
      index,
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
      index,
      externalErrors: externalErrors as Ref<string[] | undefined>,
      onUnwatch,
    });
  }

  return null;
}
