import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, unref, watch, watchEffect, isRef } from 'vue';
import { cloneDeep, isEmpty, isObject } from '../../../../../shared';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleErrors,
  $InternalRegleErrorTree,
  $InternalRegleIssues,
  $InternalReglePartialRuleTree,
  $InternalRegleResult,
  $InternalRegleRuleDecl,
  $InternalRegleSchemaErrorTree,
  $InternalRegleShortcutDefinition,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  RegleBehaviourOptions,
  RegleValidationGroupEntry,
  RegleValidationGroupOutput,
  ResetOptions,
} from '../../../types';
import { mergeArrayGroupProperties, mergeBooleanGroupProperties } from '../../../utils';
import { isRefObject } from '../../../utils';
import { isCollectionRulesDef, isFieldStatus, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveCollectionStatus } from './collections/createReactiveCollectionRoot';
import type { CommonResolverOptions, CommonResolverScopedState } from './common/common-types';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createStandardSchema } from './standard-schemas';

interface CreateReactiveNestedStatus extends CommonResolverOptions {
  state: Ref<Record<string, any> | undefined>;
  rootRules?: Ref<$InternalReglePartialRuleTree>;
  rulesDef: Ref<$InternalReglePartialRuleTree>;
  initialState: Ref<Record<string, any> | undefined>;
  originalState: Record<string, any>;
  externalErrors: Ref<$InternalRegleErrorTree | undefined> | undefined;
  schemaErrors?: Ref<Partial<$InternalRegleSchemaErrorTree> | undefined>;
  rootSchemaErrors?: Ref<Partial<$InternalRegleSchemaErrorTree> | undefined>;
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
  cachePath,
  rootRules,
  externalErrors,
  schemaErrors,
  rootSchemaErrors,
  validationGroups,
  initialState,
  originalState,
  fieldName,
  ...commonArgs
}: CreateReactiveNestedStatus): $InternalRegleStatus {
  interface ScopeState extends CommonResolverScopedState {
    $value: ComputedRef<any>;
    $silentValue: ComputedRef<any>;
    $dirty: ComputedRef<boolean>;
    $autoDirty: ComputedRef<boolean>;
    $silent: ComputedRef<boolean>;
    $issues: ComputedRef<Record<string, $InternalRegleIssues>>;
    $errors: ComputedRef<Record<string, $InternalRegleErrors>>;
    $silentErrors: ComputedRef<Record<string, $InternalRegleErrors>>;
    $ready: ComputedRef<boolean>;
    $shortcuts: ToRefs<$InternalRegleShortcutDefinition['nested']>;
    $groups: ComputedRef<Record<string, RegleValidationGroupOutput>>;
    $localPending: Ref<boolean>;
    $modifiers: ComputedRef<RegleBehaviourOptions>;
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
      mapOfRulesDef.reduce(
        (acc, [statePropKey, statePropRules]) => {
          if (!statePropRules) return acc;

          const stateRef = toRef(state.value ?? {}, statePropKey);
          const statePropRulesRef = toRef(() => statePropRules);
          const $externalErrors = toRef(externalErrors?.value ?? {}, statePropKey);
          const $schemaErrors = computed(() => schemaErrors?.value?.[statePropKey]);
          const initialStateRef = toRef(initialState?.value ?? {}, statePropKey);

          acc.push([
            statePropKey,
            createReactiveChildrenStatus({
              state: stateRef,
              rulesDef: statePropRulesRef,
              path: path ? `${path}.${statePropKey}` : statePropKey,
              cachePath: cachePath ? `${cachePath}.${statePropKey}` : statePropKey,
              externalErrors: $externalErrors,
              schemaErrors: $schemaErrors,
              initialState: initialStateRef,
              originalState: originalState?.[statePropKey],
              fieldName: statePropKey,
              ...commonArgs,
            }),
          ]);
          return acc;
        },
        [] as [string, any][]
      )
    );

    const externalRulesStatus = Object.fromEntries(
      Object.entries(unref(externalErrors) ?? {})
        .filter(([key, errors]) => !(key in rulesDef.value) && !!errors)
        .map(([key]) => {
          const stateRef = toRef(state.value ?? {}, key);
          const $externalErrors = toRef(externalErrors?.value ?? {}, key);
          const $schemaErrors = computed(() => schemaErrors?.value?.[key]);
          const initialStateRef = toRef(initialState?.value ?? {}, key);
          const computedPath = path ? `${path}.${key}` : key;
          const computedCachePath = cachePath ? `${cachePath}.${key}` : key;

          return [
            key,
            createReactiveChildrenStatus({
              state: stateRef,
              rulesDef: computed(() => ({})),
              path: computedPath,
              cachePath: computedCachePath,
              externalErrors: $externalErrors,
              schemaErrors: $schemaErrors,
              initialState: initialStateRef,
              originalState: originalState?.[key],
              fieldName: key,
              ...commonArgs,
            }),
          ];
        })
    );

    const schemasRulesStatus = Object.fromEntries(
      Object.entries(unref(schemaErrors) ?? {}).map(([key]) => {
        // Pre-compute path values to avoid repeated string operations
        const computedPath = path ? `${path}.${key}` : key;
        const computedCachePath = cachePath ? `${cachePath}.${key}` : key;

        // Create refs once and reuse
        const stateRef = toRef(state.value ?? {}, key);
        const $externalErrors = toRef(externalErrors?.value ?? {}, key);
        const $schemaErrors = computed(() => schemaErrors?.value?.[key]);
        const initialStateRef = toRef(initialState?.value ?? {}, key);
        const emptyRulesDef = computed(() => ({}));

        return [
          key,
          createReactiveChildrenStatus({
            state: stateRef,
            rulesDef: emptyRulesDef,
            path: computedPath,
            cachePath: computedCachePath,
            externalErrors: $externalErrors,
            schemaErrors: $schemaErrors,
            initialState: initialStateRef,
            originalState: originalState?.[key],
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
              cachePath: cachePath ? `${cachePath}.${key}` : key,
              externalErrors: $externalErrors,
              schemaErrors: $schemaErrors,
              initialState: initialStateRef,
              originalState: originalState?.[key],
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

  const $fields: Ref<Record<string, $InternalRegleStatusType>> = commonArgs.storage.getFieldsEntry(cachePath);

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
        $unwatch();
        createReactiveFieldsStatus();
        if (scopeState.$autoDirty.value && !scopeState.$silent.value) {
          // Do not watch deep to only track mutation on the object itself on not its children
          $touch(false, true);
        }
      },
      { flush: 'post' }
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
        { deep: true, flush: 'pre' }
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
      const $value = computed({
        get: () => state.value,
        set(value) {
          $unwatch();
          state.value = value;
          createReactiveFieldsStatus();
          if (scopeState.$autoDirty.value && !scopeState.$silent.value) {
            // Do not watch deep to only track mutation on the object itself on not its children
            $touch(false, true);
          }
        },
      });
      const $silentValue = computed({
        get: () => state.value,
        set(value) {
          $unwatch();
          state.value = value;
          createReactiveFieldsStatus();
        },
      });

      const $dirty = computed<boolean>(() => {
        const fields = $fields.value;
        const fieldKeys = Object.keys(fields);
        if (!fieldKeys.length) return false;

        for (const key of fieldKeys) {
          if (!fields[key]?.$dirty) return false;
        }
        return true;
      });

      const $anyDirty = computed<boolean>(() => {
        const fields = $fields.value;
        for (const key in fields) {
          if (fields[key]?.$anyDirty) return true;
        }
        return false;
      });

      const $invalid = computed<boolean>(() => {
        const fields = $fields.value;
        const entries = Object.entries(fields);
        if (!entries.length) return false;

        for (const [_, statusOrField] of entries) {
          if (statusOrField?.$invalid) return true;
        }
        return false;
      });

      const $correct = computed<boolean>(() => {
        const fields = Object.entries($fields.value).reduce<[string, any][]>((acc, [key, statusOrField]) => {
          if (!isFieldStatus(statusOrField) || !statusOrField.$inactive) {
            acc.push([key, statusOrField]);
          }
          return acc;
        }, []);

        if (fields.length) {
          if (commonArgs.schemaMode) {
            return fields.every(([_, statusOrField]) => statusOrField.$correct);
          }

          return fields.every(([_, statusOrField]) => {
            if (!isFieldStatus(statusOrField)) {
              return statusOrField?.$correct;
            }

            const hasRequiredRule = 'required' in statusOrField.$rules && statusOrField.$rules.required.$active;

            return hasRequiredRule
              ? statusOrField.$correct
              : !statusOrField.$invalid && !statusOrField.$pending && !statusOrField.$isDebouncing;
          });
        }
        return false;
      });

      const $error = computed<boolean>(() => {
        const fields = $fields.value;
        if (!Object.keys(fields).length) return false;

        for (const key in fields) {
          if (fields[key]?.$error) return true;
        }
        return false;
      });

      const $rewardEarly = computed<boolean | undefined>(() => {
        if (unref(commonArgs.options.rewardEarly) != null) {
          return unref(commonArgs.options.rewardEarly);
        }
        return false;
      });

      const $silent = computed<boolean>(() => {
        if (unref(commonArgs.options.silent) != null) {
          return unref(commonArgs.options.silent);
        } else if ($rewardEarly.value) {
          return true;
        }
        return false;
      });

      const $autoDirty = computed<boolean>(() => {
        if (unref(commonArgs.options.autoDirty) != null) {
          return unref(commonArgs.options.autoDirty);
        }
        return true;
      });

      const $ready = computed<boolean>(() => {
        return !($invalid.value || $pending.value);
      });

      const $localPending = ref(false);

      const $pending = computed<boolean>(() => {
        if ($localPending.value) return true;
        const fields = $fields.value;
        for (const key in fields) {
          if (fields[key]?.$pending) return true;
        }
        return false;
      });

      const $issues = computed<Record<string, $InternalRegleIssues>>(() => {
        const result: Record<string, $InternalRegleIssues> = {};
        for (const key in $fields.value) {
          result[key] = $fields.value[key]?.$issues as any;
        }
        return result;
      });

      const $errors = computed<Record<string, $InternalRegleErrors>>(() => {
        const result: Record<string, $InternalRegleErrors> = {};
        for (const key in $fields.value) {
          result[key] = $fields.value[key]?.$errors;
        }
        return result;
      });

      const $silentErrors = computed<Record<string, $InternalRegleErrors>>(() => {
        const result: Record<string, $InternalRegleErrors> = {};
        for (const key in $fields.value) {
          result[key] = $fields.value[key]?.$silentErrors;
        }
        return result;
      });

      const $edited = computed<boolean>(() => {
        if (!Object.keys($fields.value).length) return false;
        for (const key in $fields.value) {
          if (!$fields.value[key]?.$edited) return false;
        }
        return true;
      });

      const $anyEdited = computed<boolean>(() => {
        for (const key in $fields.value) {
          if ($fields.value[key]?.$anyEdited) return true;
        }
        return false;
      });

      const $name = computed(() => fieldName ?? commonArgs.options.id ?? 'root');

      const $modifiers = computed<RegleBehaviourOptions>(() => {
        return {
          autoDirty: $autoDirty.value,
          lazy: unref(commonArgs.options.lazy) ?? false,
          rewardEarly: $rewardEarly.value,
          silent: $silent.value,
          clearExternalErrorsOnChange: unref(commonArgs.options.clearExternalErrorsOnChange) ?? false,
          id: unref(commonArgs.options.id),
        };
      });

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
                    $path: path,
                    $value: state,
                    $silentValue: $silentValue,
                    $error,
                    $originalValue: originalState,
                    $pending,
                    $invalid,
                    $correct,
                    $ready,
                    $anyDirty,
                    $name,
                    $silentErrors: $silentErrors,
                    $initialValue: initialState,
                    $errors: $errors,
                    $fields,
                    $edited,
                    $anyEdited,
                    $issues,
                    '~modifiers': unref(commonArgs.options),
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
        $issues,
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
        $autoDirty,
        $silent,
        $value,
        $modifiers,
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
      for (const field of Object.values($fields.value)) {
        field?.$unwatch();
      }
    }
  }

  function $clearExternalErrors() {
    const fields = $fields.value;
    for (const field of Object.values(fields)) {
      field.$clearExternalErrors();
    }
  }

  function $reset(options?: ResetOptions<Record<string, unknown>>, fromParent?: boolean): void {
    $unwatchExternalErrors?.();
    $unwatch();

    if (!fromParent) {
      if (options?.toOriginalState) {
        state.value = cloneDeep({ ...originalState });
        initialState.value = cloneDeep({ ...originalState });
      } else if (options?.toInitialState) {
        state.value = cloneDeep({ ...initialState.value });
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

    if (!options?.keepValidationState) {
      for (const field of Object.values($fields.value)) {
        field?.$reset(options, true);
      }
    }

    if (options?.clearExternalErrors) {
      $clearExternalErrors();
    }

    define$WatchExternalErrors();
    if (!fromParent) {
      createReactiveFieldsStatus();
    }
  }

  function $touch(runCommit = true, withConditions = false): void {
    for (const field of Object.values($fields.value)) {
      field?.$touch(runCommit, withConditions);
    }
  }

  function filterNullishFields(fields: [string, unknown][]) {
    return fields.filter(([_, value]) => {
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

  function $abort() {
    for (const field of Object.values($fields.value)) {
      field.$abort();
    }
  }

  async function $validate(forceValues?: any): Promise<$InternalRegleResult> {
    try {
      if (forceValues) {
        state.value = forceValues;
      }
      if (commonArgs.schemaMode) {
        if (commonArgs.onValidate) {
          $touch(false);
          scopeState.$localPending.value = true;
          return commonArgs.onValidate();
        } else {
          return {
            valid: false,
            data: state.value,
            errors: scopeState.$errors.value,
            issues: scopeState.$issues.value,
          };
        }
      } else {
        const data = state.value;
        $abort();
        const results = await Promise.allSettled(
          Object.values($fields.value).map((statusOrField) => statusOrField.$validate())
        );

        const validationResults = results.every((value) => value.status === 'fulfilled' && value?.value.valid === true);

        return { valid: validationResults, data, errors: scopeState.$errors.value, issues: scopeState.$issues.value };
      }
    } catch {
      return { valid: false, data: state.value, errors: scopeState.$errors.value, issues: scopeState.$issues.value };
    } finally {
      scopeState.$localPending.value = false;
    }
  }

  const { $shortcuts, $localPending: _$localPending, ...restScopeState } = scopeState;

  const fullStatus = reactive({
    ...restScopeState,
    ...$shortcuts,
    $path: path,
    $initialValue: initialState,
    $originalValue: originalState,
    $fields,
    $reset,
    $touch,
    $validate,
    $unwatch,
    $watch,
    $clearExternalErrors,
    $extractDirtyFields,
    $abort,
    ...(!!rootRules ? { '~modifiers': scopeState.$modifiers } : {}),
    ...createStandardSchema($validate),
  }) satisfies $InternalRegleStatus;

  watchEffect(() => {
    // Cleanup previous field properties
    for (const key of Object.keys(fullStatus).filter((key) => !key.startsWith('$') && !key.startsWith('~'))) {
      delete fullStatus[key as keyof typeof fullStatus];
    }
    for (const field of Object.values($fields.value)) {
      if (field?.$name) {
        Object.assign(fullStatus, {
          [field.$name]: field,
        });
      }
    }
  });

  return fullStatus;
}

interface CreateReactiveChildrenStatus extends CommonResolverOptions {
  state: Ref<any>;
  rulesDef: Ref<$InternalFormPropertyTypes>;
  externalErrors: Ref<any | undefined> | undefined;
  schemaErrors?: ComputedRef<any | undefined>;
  schemaMode: boolean | undefined;
  initialState: Readonly<Ref<any>>;
  originalState: any | any[];
  onValidate?: () => Promise<$InternalRegleResult>;
}

/**
 * Main resolver divider, will distribute the logic depending on the type of the current value (primitive, object, array)
 */
export function createReactiveChildrenStatus({
  rulesDef,
  ...properties
}: CreateReactiveChildrenStatus): $InternalRegleStatusType | undefined {
  if (isCollectionRulesDef(rulesDef, properties.state, properties.schemaMode)) {
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

      const { state: _state, ...restProperties } = properties;
      return createReactiveNestedStatus({
        rulesDef,
        ...restProperties,
        state: scopeState.fakeState,
      });
    }
  } else if (isValidatorRulesDef(rulesDef)) {
    return createReactiveFieldStatus({
      rulesDef: isRef(rulesDef.value) ? rulesDef.value : (rulesDef as Ref<$InternalRegleRuleDecl>),
      ...properties,
    });
  }

  return undefined;
}
