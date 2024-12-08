import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import {
  computed,
  effectScope,
  reactive,
  ref,
  toRef,
  triggerRef,
  unref,
  watch,
  watchEffect,
} from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleCollectionErrors,
  $InternalRegleErrors,
  $InternalRegleErrorTree,
  $InternalReglePartialRuleTree,
  $InternalRegleResult,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  DeepMaybeRef,
  RegleBehaviourOptions,
  RegleShortcutDefinition,
  RegleValidationGroupEntry,
  RegleValidationGroupOutput,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { mergeArrayGroupProperties, mergeBooleanGroupProperties } from '../../../types';
import { isEmpty, isObject, isRefObject, resetValuesRecursively } from '../../../utils';
import type { RegleStorage } from '../../useStorage';
import { isCollectionRulesDef, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveCollectionStatus } from './createReactiveCollectionStatus';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';

interface CreateReactiveNestedStatus {
  rootRules?: Ref<$InternalReglePartialRuleTree>;
  scopeRules: Ref<$InternalReglePartialRuleTree>;
  state: Ref<Record<string, any>>;
  customMessages?: CustomRulesDeclarationTree;
  path?: string;
  index?: number;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Ref<$InternalRegleErrorTree | undefined> | undefined;
  initialState: Record<string, any> | undefined;
  fieldName: string;
  shortcuts: RegleShortcutDefinition | undefined;
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
  initialState,
  shortcuts,
  fieldName,
}: CreateReactiveNestedStatus): $InternalRegleStatus {
  type ScopeState = {
    $dirty: ComputedRef<boolean>;
    $anyDirty: ComputedRef<boolean>;
    $invalid: ComputedRef<boolean>;
    $valid: ComputedRef<boolean>;
    $error: ComputedRef<boolean>;
    $pending: ComputedRef<boolean>;
    $errors: ComputedRef<Record<string, $InternalRegleErrors>>;
    $silentErrors: ComputedRef<Record<string, $InternalRegleErrors>>;
    $ready: ComputedRef<boolean>;
    $name: ComputedRef<string>;
    $shortcuts: ToRefs<RegleShortcutDefinition['nested']>;
    $groups: ComputedRef<Record<string, RegleValidationGroupOutput>>;
  };
  let scope = effectScope();
  let scopeState!: ScopeState;

  let nestedScopes: EffectScope[] = [];

  let $unwatchRules: WatchStopHandle | null = null;
  let $unwatchExternalErrors: WatchStopHandle | null = null;
  let $unwatchState: WatchStopHandle | null = null;
  let $unwatchGroups: WatchStopHandle | null = null;

  async function createReactiveFieldsStatus(watch = true) {
    const scopedRulesStatus = Object.fromEntries(
      Object.entries(scopeRules.value)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(state.value, statePropKey);
            triggerRef(stateRef);
            const statePropRulesRef = toRef(() => statePropRules);

            const $externalErrors = toRef(externalErrors?.value!, statePropKey);

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
                initialState: initialState?.[statePropKey],
                shortcuts,
                fieldName: statePropKey,
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
        .filter(([key]) => !(key in scopeRules.value))
        .map(([key, errors]) => {
          if (errors) {
            const stateRef = toRef(state.value, key);
            return [
              key,
              createReactiveChildrenStatus({
                state: stateRef,
                rulesDef: computed(() => ({})),
                customMessages,
                path: path ? `${path}.${key}` : key,
                storage,
                options,
                externalErrors: toRef(externalErrors?.value ?? {}, key),
                initialState: initialState?.[key],
                shortcuts,
                fieldName: key,
              }),
            ];
          }
          return [];
        })
    );

    const statesWithNoRules = Object.fromEntries(
      Object.entries(state.value)
        .filter(
          ([key]) => !(key in scopeRules.value) && !(key in (externalRulesStatus.value ?? {}))
        )
        .map(([key, value]) => {
          const stateRef = toRef(state.value, key);
          return [
            key,
            createReactiveChildrenStatus({
              state: stateRef,
              rulesDef: computed(() => ({})),
              customMessages,
              path: path ? `${path}.${key}` : key,
              storage,
              options,
              externalErrors: toRef(externalErrors?.value ?? {}, key),
              initialState: initialState?.[key],
              shortcuts,
              fieldName: key,
            }),
          ];
        })
    );

    $fields.value = {
      ...scopedRulesStatus,
      ...externalRulesStatus,
      ...statesWithNoRules,
    };
    if (watch) {
      $watch();
    }
  }

  const $fields: Ref<Record<string, $InternalRegleStatusType>> = storage.getFieldsEntry(path);
  createReactiveFieldsStatus();

  function $reset(): void {
    $unwatchExternalErrors?.();
    Object.values($fields.value).forEach((statusOrField) => {
      statusOrField.$reset();
    });
    define$WatchExternalErrors();
  }

  function $touch(runCommit = true, withConditions = false): void {
    Object.values($fields.value).forEach((statusOrField) => {
      statusOrField.$touch(runCommit, withConditions);
    });
  }

  async function $validate(): Promise<$InternalRegleResult> {
    try {
      const data = state.value;

      const results = await Promise.allSettled(
        Object.values($fields.value).map((statusOrField) => {
          return statusOrField.$validate();
        })
      );

      const validationResults = results.every((value) => {
        if (value.status === 'fulfilled') {
          return value.value.result === true;
        } else {
          return false;
        }
      });
      return { result: validationResults, data };
    } catch (e) {
      return { result: false, data: state.value };
    }
  }

  function define$WatchExternalErrors() {
    if (externalErrors?.value) {
      $unwatchExternalErrors = watch(
        externalErrors,
        () => {
          $unwatch();
          createReactiveFieldsStatus();
        },
        { deep: true }
      );
    }
  }

  function $watch() {
    if (rootRules) {
      $unwatchRules = watch(
        rootRules,
        () => {
          $unwatch();
          createReactiveFieldsStatus();
        },
        { deep: true, flush: 'post' }
      );

      define$WatchExternalErrors();
    }

    $unwatchState = watch(
      state,
      () => {
        // Do not watch deep to only track mutation on the object itself on not its children
        $unwatch();
        createReactiveFieldsStatus();
        $touch(true, true);
      },
      { flush: 'sync' }
    );

    scopeState = scope.run(() => {
      const $dirty = computed<boolean>(() => {
        return (
          !!Object.entries($fields.value).length &&
          Object.entries($fields.value).every(([key, statusOrField]) => {
            return statusOrField?.$dirty;
          })
        );
      });

      const $anyDirty = computed<boolean>(() => {
        return Object.entries($fields.value).some(([key, statusOrField]) => {
          return statusOrField?.$dirty;
        });
      });

      const $invalid = computed<boolean>(() => {
        return Object.entries($fields.value).some(([key, statusOrField]) => {
          return statusOrField?.$invalid;
        });
      });

      const $valid = computed<boolean>(() => {
        return Object.entries($fields.value).every(([key, statusOrField]) => {
          return statusOrField?.$valid;
        });
      });

      const $error = computed<boolean>(() => {
        return $dirty.value && !$pending.value && $invalid.value;
      });

      const $ready = computed<boolean>(() => {
        if (!unref(options.autoDirty)) {
          return !($invalid.value || $pending.value);
        }
        return $anyDirty.value && !($invalid.value || $pending.value);
      });

      const $pending = computed<boolean>(() => {
        return Object.entries($fields.value).some(([key, statusOrField]) => {
          return statusOrField?.$pending;
        });
      });

      const $errors = computed(() => {
        return Object.fromEntries(
          Object.entries($fields.value).map(([key, statusOrField]) => {
            return [key, statusOrField?.$errors];
          })
        );
      });

      const $silentErrors = computed(() => {
        return Object.fromEntries(
          Object.entries($fields.value).map(([key, statusOrField]) => {
            return [key, statusOrField?.$silentErrors];
          })
        );
      });

      const $name = computed(() => fieldName);

      function processShortcuts() {
        if (shortcuts?.nested) {
          Object.entries(shortcuts.nested).forEach(([key, value]) => {
            const scope = effectScope();

            $shortcuts[key] = scope.run(() => {
              const result = ref();

              watchEffect(() => {
                result.value = value({
                  $dirty: $dirty.value,
                  $value: state,
                  $error: $error.value,
                  $pending: $pending.value,
                  $invalid: $invalid.value,
                  $valid: $valid.value,
                  $ready: $ready.value,
                  $anyDirty: $anyDirty.value,
                  $name: $name.value,
                  $silentErrors: $silentErrors.value as any,
                  $errors: $errors.value as any,
                  $fields: $fields.value,
                });
              });
              return result;
            })!;

            nestedScopes.push(scope);
          });
        }
      }

      const $groups = computed<Record<string, RegleValidationGroupOutput>>(() => {
        if (validationGroups) {
          return Object.fromEntries(
            Object.entries(validationGroups?.($fields.value) ?? {}).map(([key, entries]) => {
              if (entries.length) {
                return [
                  key,
                  {
                    ...Object.fromEntries(
                      (['$invalid', '$error', '$pending', '$dirty', '$valid'] as const).map(
                        (property) => [property, mergeBooleanGroupProperties(entries, property)]
                      )
                    ),
                    ...Object.fromEntries(
                      (['$errors', '$silentErrors'] as const).map((property) => [
                        property,
                        mergeArrayGroupProperties(entries, property),
                      ])
                    ),
                  },
                ];
              }
              return [];
            })
          );
        }
        return {};
      });

      const $shortcuts: ToRefs<Record<string, Readonly<Ref<any>>>> = {};
      processShortcuts();

      return {
        $dirty,
        $anyDirty,
        $invalid,
        $valid,
        $error,
        $pending,
        $errors,
        $silentErrors,
        $ready,
        $name,
        $shortcuts,
        $groups,
      } satisfies ScopeState;
    })!;
  }

  function $unwatch() {
    $unwatchRules?.();
    $unwatchExternalErrors?.();
    $unwatchState?.();
    $unwatchGroups?.();

    nestedScopes.forEach((s) => s.stop());
    nestedScopes = [];

    if ($fields.value) {
      Object.entries($fields.value).forEach(([_, field]) => {
        field.$unwatch();
      });
    }
  }

  function $clearExternalErrors() {
    Object.entries($fields.value).forEach(([_, field]) => {
      field.$clearExternalErrors();
    });
  }

  function $resetAll() {
    $unwatch();
    resetValuesRecursively(state, initialState ?? {});
    createReactiveFieldsStatus(false);
    $reset();
    $watch();
  }

  function $extractDirtyFields(filterNullishValues: boolean = true): Record<string, any> {
    let dirtyFields = Object.entries($fields.value).map(([key, field]) => {
      return [key, field.$extractDirtyFields(filterNullishValues)];
    });
    if (filterNullishValues) {
      dirtyFields = dirtyFields.filter(([key, value]) => {
        if (isObject(value)) {
          return !isEmpty(value);
        } else if (Array.isArray(value)) {
          return value.length;
        } else {
          return !!value;
        }
      });
    }
    return Object.fromEntries(dirtyFields);
  }

  const { $shortcuts, ...restScopeState } = scopeState;

  return reactive({
    ...restScopeState,
    ...$shortcuts,
    $fields,
    $value: state,
    $resetAll,
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
    $clearExternalErrors,
    $extractDirtyFields,
  }) satisfies $InternalRegleStatus;
}

interface CreateReactiveChildrenStatus {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalFormPropertyTypes>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  index?: number;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
  externalErrors: Ref<$InternalRegleErrors | undefined> | undefined;
  initialState: any;
  fieldName: string;
  shortcuts: RegleShortcutDefinition | undefined;
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
  initialState,
  shortcuts,
  onUnwatch,
  fieldName,
}: CreateReactiveChildrenStatus): $InternalRegleStatusType | null {
  if (isCollectionRulesDef(rulesDef, state)) {
    return createReactiveCollectionStatus({
      state: state as Ref<unknown & { $id?: string }[]>,
      rulesDef,
      customMessages,
      path,
      storage,
      options,
      index,
      externalErrors: externalErrors as Ref<$InternalRegleCollectionErrors>,
      initialState,
      fieldName,
      shortcuts,
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
      initialState,
      shortcuts,
      fieldName,
      externalErrors: externalErrors as Readonly<Ref<$InternalRegleErrorTree | undefined>>,
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
      shortcuts,
      initialState,
      fieldName,
    });
  }

  return null;
}
