import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, unref, watch, watchEffect } from 'vue';
import { cloneDeep, isEmpty, isObject } from '../../../../../shared';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleErrors,
  $InternalRegleErrorTree,
  $InternalReglePartialRuleTree,
  $InternalRegleResult,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  RegleShortcutDefinition,
  RegleValidationGroupEntry,
  RegleValidationGroupOutput,
} from '../../../types';
import { mergeArrayGroupProperties, mergeBooleanGroupProperties } from '../../../types';
import { isRefObject } from '../../../utils';
import { isCollectionRulesDef, isFieldStatus, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveCollectionStatus } from './collections/createReactiveCollectionRoot';
import type { CommonResolverOptions, CommonResolverScopedState } from './common/common-types';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';

interface CreateReactiveNestedStatus extends CommonResolverOptions {
  state: Ref<Record<string, any>>;
  rootRules?: Ref<$InternalReglePartialRuleTree>;
  rulesDef: Ref<$InternalReglePartialRuleTree>;
  initialState: Ref<Record<string, any> | undefined>;
  externalErrors: Ref<$InternalRegleErrorTree | undefined> | undefined;
  validationGroups?:
    | ((rules: { [x: string]: $InternalRegleStatusType }) => Record<string, RegleValidationGroupEntry[]>)
    | undefined;
}

export function createReactiveNestedStatus({
  rulesDef,
  state,
  path = '',
  rootRules,
  externalErrors,
  validationGroups,
  initialState,
  fieldName,
  ...commonArgs
}: CreateReactiveNestedStatus): $InternalRegleStatus {
  interface ScopeState extends CommonResolverScopedState {
    $silentValue: ComputedRef<any>;
    $dirty: ComputedRef<boolean>;
    $errors: ComputedRef<Record<string, $InternalRegleErrors>>;
    $silentErrors: ComputedRef<Record<string, $InternalRegleErrors>>;
    $ready: ComputedRef<boolean>;
    $shortcuts: ToRefs<RegleShortcutDefinition['nested']>;
    $groups: ComputedRef<Record<string, RegleValidationGroupOutput>>;
  }
  let scope = effectScope();
  let scopeState!: ScopeState;

  let nestedScopes: EffectScope[] = [];

  let $unwatchRules: WatchStopHandle | null = null;
  let $unwatchExternalErrors: WatchStopHandle | null = null;
  let $unwatchState: WatchStopHandle | null = null;
  let $unwatchGroups: WatchStopHandle | null = null;

  async function createReactiveFieldsStatus(watchSources = true) {
    const mapOfRulesDef = Object.entries(rulesDef.value);

    const scopedRulesStatus = Object.fromEntries(
      mapOfRulesDef
        .filter(([_, rule]) => !!rule)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(state.value, statePropKey);
            const statePropRulesRef = toRef(() => statePropRules);
            const $externalErrors = toRef(externalErrors?.value ?? {}, statePropKey);
            const initialStateRef = toRef(initialState?.value ?? {}, statePropKey);

            return [
              statePropKey,
              createReactiveChildrenStatus({
                state: stateRef,
                rulesDef: statePropRulesRef,
                path: path ? `${path}.${statePropKey}` : statePropKey,
                externalErrors: $externalErrors,
                initialState: initialStateRef,
                fieldName: statePropKey,
                ...commonArgs,
              }),
            ];
          }
          return [];
        })
    );

    const externalRulesStatus = Object.fromEntries(
      Object.entries(unref(externalErrors) ?? {})
        .filter(([key, errors]) => !(key in rulesDef.value) && !!errors)
        .map(([key]) => {
          const stateRef = toRef(state.value, key);
          const initialStateRef = toRef(initialState?.value ?? {}, key);
          return [
            key,
            createReactiveChildrenStatus({
              state: stateRef,
              rulesDef: computed(() => ({})),
              path: path ? `${path}.${key}` : key,
              externalErrors: toRef(externalErrors?.value ?? {}, key),
              initialState: initialStateRef,
              fieldName: key,
              ...commonArgs,
            }),
          ];
        })
    );

    const statesWithNoRules = Object.fromEntries(
      Object.entries(state.value)
        .filter(([key]) => !(key in rulesDef.value) && !(key in (externalRulesStatus.value ?? {})))
        .map(([key]) => {
          const stateRef = toRef(state.value, key);
          const initialStateRef = toRef(initialState?.value ?? {}, key);

          return [
            key,
            createReactiveChildrenStatus({
              state: stateRef,
              rulesDef: computed(() => ({})),
              path: path ? `${path}.${key}` : key,
              externalErrors: toRef(externalErrors?.value ?? {}, key),
              initialState: initialStateRef,
              fieldName: key,
              ...commonArgs,
            }),
          ];
        })
    );

    $fields.value = {
      ...scopedRulesStatus,
      ...externalRulesStatus,
      ...statesWithNoRules,
    };
    if (watchSources) {
      $watch();
    }
  }

  const $fields: Ref<Record<string, $InternalRegleStatusType>> = commonArgs.storage.getFieldsEntry(path);

  // Create reactive nested fields
  createReactiveFieldsStatus();

  function $reset(): void {
    $unwatchExternalErrors?.();
    Object.values($fields.value).forEach((statusOrField) => {
      statusOrField.$reset();
    });
    initialState.value = { ...cloneDeep(state.value) };
    define$WatchExternalErrors();
  }

  function $touch(runCommit = true, withConditions = false): void {
    Object.values($fields.value).forEach((statusOrField) => {
      statusOrField.$touch(runCommit, withConditions);
    });
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

  function define$watchState() {
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
  }

  function $watch() {
    if (rootRules) {
      $unwatchRules?.();
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

    define$watchState();

    scope = effectScope();
    scopeState = scope.run(() => {
      const $silentValue = computed({
        get: () => state.value,
        set(value) {
          $unwatch();
          state.value = value;
          createReactiveFieldsStatus();
        },
      });

      const $dirty = computed<boolean>(() => {
        return (
          !!Object.entries($fields.value).length &&
          Object.entries($fields.value).every(([_, statusOrField]) => {
            return statusOrField?.$dirty;
          })
        );
      });

      const $anyDirty = computed<boolean>(() => {
        return Object.entries($fields.value).some(([_, statusOrField]) => {
          return statusOrField?.$anyDirty;
        });
      });

      const $invalid = computed<boolean>(() => {
        return Object.entries($fields.value).some(([_, statusOrField]) => {
          return statusOrField?.$invalid;
        });
      });

      const $valid = computed<boolean>(() => {
        const fields = Object.entries($fields.value).filter(([_, statusOrField]) => {
          if (isFieldStatus(statusOrField)) {
            return !statusOrField.$inactive;
          }
          return true;
        });
        if (fields.length) {
          return fields.every(([_, statusOrField]) => {
            return statusOrField?.$valid;
          });
        }
        return false;
      });

      const $error = computed<boolean>(() => $anyDirty.value && !$pending.value && $invalid.value);

      const $rewardEarly = computed<boolean | undefined>(() => {
        if (unref(commonArgs.options.rewardEarly) != null) {
          return unref(commonArgs.options.rewardEarly);
        }
        return false;
      });

      const $autoDirty = computed<boolean | undefined>(() => {
        if (unref(commonArgs.options.autoDirty) != null) {
          return unref(commonArgs.options.autoDirty);
        } else if ($rewardEarly.value) {
          return false;
        }
        return true;
      });

      const $ready = computed<boolean>(() => {
        if (!$autoDirty.value) {
          return !($invalid.value || $pending.value);
        }
        return $anyDirty.value && !($invalid.value || $pending.value);
      });

      const $pending = computed<boolean>(() => {
        return Object.entries($fields.value).some(([key, statusOrField]) => {
          return statusOrField?.$pending;
        });
      });

      const $errors = computed<Record<string, $InternalRegleErrors>>(() => {
        return Object.fromEntries(
          Object.entries($fields.value).map(([key, statusOrField]) => {
            return [key, statusOrField?.$errors];
          })
        );
      });

      const $silentErrors = computed<Record<string, $InternalRegleErrors>>(() => {
        return Object.fromEntries(
          Object.entries($fields.value).map(([key, statusOrField]) => {
            return [key, statusOrField?.$silentErrors];
          })
        );
      });

      const $edited = computed<boolean>(() => {
        return (
          !!Object.entries($fields.value).length &&
          Object.entries($fields.value).every(([_, statusOrField]) => {
            return statusOrField?.$edited;
          })
        );
      });

      const $anyEdited = computed<boolean>(() => {
        return Object.entries($fields.value).some(([_, statusOrField]) => {
          return statusOrField?.$anyEdited;
        });
      });

      const $name = computed(() => fieldName);

      function processShortcuts() {
        if (commonArgs.shortcuts?.nested) {
          Object.entries(commonArgs.shortcuts.nested).forEach(([key, value]) => {
            const scope = effectScope();

            $shortcuts[key] = scope.run(() => {
              const result = ref();

              watchEffect(() => {
                result.value = value(
                  reactive({
                    $dirty,
                    $value: state,
                    $silentValue,
                    $error,
                    $pending,
                    $invalid,
                    $valid,
                    $ready,
                    $anyDirty,
                    $name,
                    $silentErrors: $silentErrors as any,
                    $errors: $errors as any,
                    $fields,
                    $edited,
                    $anyEdited,
                  })
                );
              });
              return result;
            })!;

            nestedScopes.push(scope);
          });
        }
      }

      const $groups = computed<Record<string, RegleValidationGroupOutput>>({
        get: () => {
          if (validationGroups) {
            return Object.fromEntries(
              Object.entries(validationGroups?.($fields.value) ?? {}).map(([key, entries]) => {
                if (entries.length) {
                  return [
                    key,
                    {
                      ...Object.fromEntries(
                        (['$invalid', '$error', '$pending', '$dirty', '$valid'] as const).map((property) => [
                          property,
                          mergeBooleanGroupProperties(entries, property),
                        ])
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
        },
        set() {},
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
        $silentValue,
        $edited,
        $anyEdited,
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

    scope.stop();

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

  async function $resetAll() {
    $unwatch();
    state.value = cloneDeep({ ...(initialState.value ?? {}) });
    $reset();
    createReactiveFieldsStatus();
  }

  function filterNullishFields(fields: [string, unknown][]) {
    return fields.filter(([key, value]) => {
      if (isObject(value)) {
        return !(value && typeof value === 'object' && '_null' in value) && !isEmpty(value);
      } else if (Array.isArray(value)) {
        return value.length;
      } else {
        return true;
      }
    });
  }

  function $extractDirtyFields(filterNullishValues: boolean = true): Record<string, any> {
    let dirtyFields: [string, unknown][] = Object.entries($fields.value).map(([key, field]) => {
      return [key, field.$extractDirtyFields(filterNullishValues)];
    });
    if (filterNullishValues) {
      dirtyFields = filterNullishFields(dirtyFields);
    }
    return Object.fromEntries(dirtyFields);
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

interface CreateReactiveChildrenStatus extends CommonResolverOptions {
  state: Ref<any>;
  rulesDef: Ref<$InternalFormPropertyTypes>;
  externalErrors: Ref<$InternalRegleErrors | undefined> | undefined;
  initialState: Readonly<Ref<any>>;
}

/**
 * Main resolver divider, will distribute the logic depending on the type of the current value (primitive, object, array)
 */
export function createReactiveChildrenStatus({
  rulesDef,
  externalErrors,
  ...properties
}: CreateReactiveChildrenStatus): $InternalRegleStatusType | undefined {
  if (isCollectionRulesDef(rulesDef, properties.state)) {
    return createReactiveCollectionStatus({
      rulesDef,
      externalErrors: externalErrors as any,
      ...properties,
    });
  } else if (isNestedRulesDef(properties.state, rulesDef)) {
    if (isRefObject(properties.state)) {
      return createReactiveNestedStatus({
        rulesDef,
        externalErrors: externalErrors as any,
        ...properties,
      });
    } else {
      const fakeState = ref({});

      const unwatchState = watch(
        fakeState,
        (value) => {
          unwatchState();
          properties.state.value = value;
        },
        { deep: true }
      );

      const { state, ...restProperties } = properties;
      return createReactiveNestedStatus({
        rulesDef,
        externalErrors: externalErrors as any,
        ...restProperties,
        state: fakeState,
      });
    }
  } else if (isValidatorRulesDef(rulesDef)) {
    return createReactiveFieldStatus({
      rulesDef,
      externalErrors: externalErrors as any,
      ...properties,
    });
  }

  return undefined;
}
