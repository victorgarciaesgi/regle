import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, nextTick, reactive, ref, toRef, unref, watch, watchEffect } from 'vue';
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
  ResetOptions,
} from '../../../types';
import { mergeArrayGroupProperties, mergeBooleanGroupProperties } from '../../../types';
import { isRefObject } from '../../../utils';
import { isCollectionRulesDef, isFieldStatus, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveCollectionStatus } from './collections/createReactiveCollectionRoot';
import type { CommonResolverOptions, CommonResolverScopedState } from './common/common-types';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';

interface CreateReactiveNestedStatus extends CommonResolverOptions {
  state: Ref<Record<string, any> | undefined>;
  rootRules?: Ref<$InternalReglePartialRuleTree>;
  rulesDef: Ref<$InternalReglePartialRuleTree>;
  initialState: Ref<Record<string, any> | undefined>;
  externalErrors: Ref<$InternalRegleErrorTree | undefined> | undefined;
  schemaErrors?: Ref<Partial<$InternalRegleErrorTree> | undefined>;
  rootSchemaErrors?: Ref<Partial<$InternalRegleErrorTree> | undefined>;
  schemaMode: boolean | undefined;
  onValidate?: () => Promise<$InternalRegleResult>;
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
  schemaErrors,
  rootSchemaErrors,
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
    $localPending: Ref<boolean>;
  }
  let scope = effectScope();
  let scopeState!: ScopeState;

  let nestedScopes: EffectScope[] = [];

  let $unwatchRules: WatchStopHandle | null = null;
  let $unwatchSchemaErrors: WatchStopHandle | null = null;
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
            const stateRef = toRef(state.value ?? {}, statePropKey);
            const statePropRulesRef = toRef(() => statePropRules);
            const $externalErrors = toRef(externalErrors?.value ?? {}, statePropKey);
            const $schemaErrors = computed(() => schemaErrors?.value?.[statePropKey]);
            const initialStateRef = toRef(initialState?.value ?? {}, statePropKey);

            return [
              statePropKey,
              createReactiveChildrenStatus({
                state: stateRef,
                rulesDef: statePropRulesRef,
                path: path ? `${path}.${statePropKey}` : statePropKey,
                externalErrors: $externalErrors,
                schemaErrors: $schemaErrors,
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
          const stateRef = toRef(state.value ?? {}, key);
          const $externalErrors = toRef(externalErrors?.value ?? {}, key);
          const $schemaErrors = computed(() => schemaErrors?.value?.[key]);
          const initialStateRef = toRef(initialState?.value ?? {}, key);
          return [
            key,
            createReactiveChildrenStatus({
              state: stateRef,
              rulesDef: computed(() => ({})),
              path: path ? `${path}.${key}` : key,
              externalErrors: $externalErrors,
              schemaErrors: $schemaErrors,
              initialState: initialStateRef,
              fieldName: key,
              ...commonArgs,
            }),
          ];
        })
    );

    const schemasRulesStatus = Object.fromEntries(
      Object.entries(unref(schemaErrors) ?? {}).map(([key]) => {
        const stateRef = toRef(state.value ?? {}, key);
        const $externalErrors = toRef(externalErrors?.value ?? {}, key);
        const $schemaErrors = computed(() => schemaErrors?.value?.[key]);
        const initialStateRef = toRef(initialState?.value ?? {}, key);

        return [
          key,
          createReactiveChildrenStatus({
            state: stateRef,
            rulesDef: computed(() => ({})),
            path: path ? `${path}.${key}` : key,
            externalErrors: $externalErrors,
            schemaErrors: $schemaErrors,
            initialState: initialStateRef,
            fieldName: key,
            ...commonArgs,
          }),
        ];
      })
    );

    const statesWithNoRules = Object.fromEntries(
      Object.entries(state.value ?? {})
        .filter(
          ([key]) =>
            !(key in rulesDef.value) && !(key in (externalRulesStatus ?? {})) && !(key in (schemasRulesStatus ?? {}))
        )
        .map(([key]) => {
          const stateRef = toRef(state.value ?? {}, key);
          const $externalErrors = toRef(externalErrors?.value ?? {}, key);
          const $schemaErrors = computed(() => schemaErrors?.value?.[key]);
          const initialStateRef = toRef(initialState?.value ?? {}, key);

          return [
            key,
            createReactiveChildrenStatus({
              state: stateRef,
              rulesDef: computed(() => ({})),
              path: path ? `${path}.${key}` : key,
              externalErrors: $externalErrors,
              schemaErrors: $schemaErrors,
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
      ...schemasRulesStatus,
      ...statesWithNoRules,
    };
    if (watchSources) {
      $watch();
    }
  }

  const $fields: Ref<Record<string, $InternalRegleStatusType>> = commonArgs.storage.getFieldsEntry(path);

  // Create reactive nested fields
  createReactiveFieldsStatus();

  function define$WatchExternalErrors() {
    if (externalErrors) {
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

    if (rootSchemaErrors) {
      $unwatchSchemaErrors?.();
      $unwatchSchemaErrors = watch(
        rootSchemaErrors,
        () => {
          $unwatch();
          createReactiveFieldsStatus();
        },
        { deep: true, flush: 'post' }
      );
    }

    define$watchState();

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
        return (
          !!Object.entries($fields.value).length &&
          Object.entries($fields.value).some(([_, statusOrField]) => {
            return statusOrField?.$invalid;
          })
        );
      });

      const $correct = computed<boolean>(() => {
        const fields = Object.entries($fields.value).filter(([_, statusOrField]) => {
          if (isFieldStatus(statusOrField)) {
            return !statusOrField.$inactive;
          }
          return true;
        });
        if (fields.length) {
          return fields.every(([_, statusOrField]) => {
            return statusOrField?.$correct || (statusOrField.$anyDirty && !statusOrField.$invalid);
          });
        }
        return false;
      });

      const $error = computed<boolean>(() => {
        return (
          !!Object.entries($fields.value).length &&
          Object.entries($fields.value).some(([_, statusOrField]) => {
            return statusOrField?.$error;
          })
        );
      });

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

      const $localPending = ref(false);

      const $pending = computed<boolean>(() => {
        return (
          $localPending.value ||
          Object.entries($fields.value).some(([key, statusOrField]) => {
            return statusOrField?.$pending;
          })
        );
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
                    $value: state as any,
                    $silentValue: $silentValue as any,
                    $error,
                    $pending,
                    $invalid,
                    $correct,
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
                        (['$invalid', '$error', '$pending', '$dirty', '$correct'] as const).map((property) => [
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
        $correct,
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
        $localPending,
      } satisfies ScopeState;
    })!;
  }

  function $unwatch() {
    $unwatchRules?.();
    $unwatchExternalErrors?.();
    $unwatchState?.();
    $unwatchGroups?.();
    $unwatchSchemaErrors?.();

    // Apparently doesn't need to be stopped with Vue 3.5 https://github.com/vuejs/core/issues/11886
    // nestedScopes.forEach((s) => s.stop());
    nestedScopes = [];

    // Apparently doesn't need to be stopped with Vue 3.5 https://github.com/vuejs/core/issues/11886
    // scope.stop();
    scopeState = {} as any;

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

  function $reset(options?: ResetOptions<Record<string, unknown>>, fromParent?: boolean): void {
    $unwatchExternalErrors?.();
    $unwatch();

    if (!fromParent) {
      if (options?.toInitialState) {
        state.value = cloneDeep({ ...(initialState.value ?? {}) });
      } else if (options?.toState) {
        let newInitialState: Record<string, unknown>;
        if (typeof options?.toState === 'function') {
          newInitialState = options?.toState();
        } else {
          newInitialState = options?.toState;
        }
        initialState.value = cloneDeep(newInitialState);
        state.value = cloneDeep(newInitialState);
      } else {
        initialState.value = cloneDeep(state.value);
      }
    }

    Object.values($fields.value).forEach((statusOrField) => {
      statusOrField.$reset(options, true);
    });

    define$WatchExternalErrors();
    if (!fromParent) {
      createReactiveFieldsStatus();
    }
  }

  function $touch(runCommit = true, withConditions = false): void {
    Object.values($fields.value).forEach((statusOrField) => {
      statusOrField.$touch(runCommit, withConditions);
    });
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
      if (commonArgs.schemaMode) {
        if (commonArgs.onValidate) {
          $touch(false);
          scopeState.$localPending.value = true;
          return commonArgs.onValidate();
        } else {
          return { valid: false, data: state.value };
        }
      } else {
        const data = state.value;

        const results = await Promise.allSettled(
          Object.values($fields.value).map((statusOrField) => {
            return statusOrField.$validate();
          })
        );

        const validationResults = results.every((value) => {
          if (value.status === 'fulfilled') {
            return value.value.valid === true;
          } else {
            return false;
          }
        });
        return { valid: validationResults, data };
      }
    } catch (e) {
      return { valid: false, data: state.value };
    } finally {
      scopeState.$localPending.value = false;
    }
  }

  const { $shortcuts, $localPending, ...restScopeState } = scopeState;

  return reactive({
    ...restScopeState,
    ...$shortcuts,
    $fields,
    $value: state,
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
  externalErrors: Ref<any | undefined> | undefined;
  schemaErrors?: ComputedRef<any | undefined>;
  schemaMode: boolean | undefined;
  initialState: Readonly<Ref<any>>;
}

/**
 * Main resolver divider, will distribute the logic depending on the type of the current value (primitive, object, array)
 */
export function createReactiveChildrenStatus({
  rulesDef,
  ...properties
}: CreateReactiveChildrenStatus): $InternalRegleStatusType | undefined {
  if (isCollectionRulesDef(rulesDef, properties.state)) {
    return createReactiveCollectionStatus({
      rulesDef,
      ...properties,
    });
  } else if (isNestedRulesDef(properties.state, rulesDef)) {
    if (isRefObject(properties.state)) {
      return createReactiveNestedStatus({
        rulesDef,
        ...properties,
      });
    } else {
      // Undefined object can still be updated throw this fake state trap
      const scope = effectScope();

      const scopeState = scope.run(() => {
        const fakeState = toRef(properties.state.value ? properties.state : ref({}));

        watch(
          () => properties.state.value,
          (value) => {
            fakeState.value = value;
          },
          { deep: true }
        );
        watch(
          fakeState,
          (value) => {
            properties.state.value = value;
          },
          { deep: true }
        );

        return { fakeState };
      })!;

      const { state, ...restProperties } = properties;
      return createReactiveNestedStatus({
        rulesDef,
        ...restProperties,
        state: scopeState.fakeState,
      });
    }
  } else if (isValidatorRulesDef(rulesDef)) {
    return createReactiveFieldStatus({
      rulesDef,
      ...properties,
    });
  }

  return undefined;
}
