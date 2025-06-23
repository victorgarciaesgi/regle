import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, unref, watch, watchEffect } from 'vue';
import { cloneDeep, isEmpty } from '../../../../../../shared';
import type {
  $InternalRegleCollectionErrors,
  $InternalRegleCollectionIssues,
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleResult,
  $InternalRegleSchemaCollectionErrors,
  $InternalRegleShortcutDefinition,
  CustomRulesDeclarationTree,
  FieldRegleBehaviourOptions,
  RegleShortcutDefinition,
  ResetOptions,
  ResolvedRegleBehaviourOptions,
} from '../../../../types';
import { randomId, unwrapGetter } from '../../../../utils';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../../utils/version-compare';
import type { RegleStorage } from '../../../useStorage';
import { isNestedRulesStatus, isRuleDef } from '../../guards';
import type { CommonResolverScopedState, StateWithId } from '../common/common-types';
import { createReactiveFieldStatus } from '../createReactiveFieldStatus';
import { createCollectionElement } from './createReactiveCollectionElement';

interface CreateReactiveCollectionStatusArgs {
  state: Ref<(StateWithId[] & StateWithId) | undefined>;
  rulesDef: Ref<$InternalRegleCollectionRuleDecl>;
  customMessages: CustomRulesDeclarationTree | undefined;
  path: string;
  fieldName: string;
  index?: number;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Ref<$InternalRegleCollectionErrors | undefined> | undefined;
  schemaErrors?: ComputedRef<$InternalRegleSchemaCollectionErrors | undefined> | undefined;
  schemaMode: boolean | undefined;
  initialState: Ref<(unknown | undefined)[]>;
  shortcuts: $InternalRegleShortcutDefinition | undefined;
}

export function createReactiveCollectionStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
  externalErrors,
  schemaErrors,
  schemaMode,
  initialState,
  shortcuts,
  fieldName,
}: CreateReactiveCollectionStatusArgs): $InternalRegleCollectionStatus | undefined {
  interface ScopeReturnState extends CommonResolverScopedState {
    $dirty: ComputedRef<boolean>;
    $issues: ComputedRef<$InternalRegleCollectionIssues>;
    $errors: ComputedRef<$InternalRegleCollectionErrors>;
    $silentErrors: ComputedRef<$InternalRegleCollectionErrors>;
    $ready: ComputedRef<boolean>;
    $shortcuts: ToRefs<RegleShortcutDefinition['collections']>;
    $silentValue: ComputedRef<any>;
    $rewardEarly: ComputedRef<boolean>;
    $silent: ComputedRef<boolean>;
    $autoDirty: ComputedRef<boolean>;
  }
  interface ImmediateScopeReturnState {
    isPrimitiveArray: ComputedRef<boolean>;
  }

  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  let immediateScope = effectScope();
  let immediateScopeState!: ImmediateScopeReturnState;

  let collectionScopes: EffectScope[] = [];

  if (!Array.isArray(state.value) && !rulesDef.value.$each) {
    return undefined;
  }
  const $id = ref<string>() as Ref<string>;
  const $value = ref(state.value);

  const $localOptions = ref({}) as Ref<FieldRegleBehaviourOptions>;

  let $unwatchState: WatchStopHandle | undefined;
  let $unwatchDirty: WatchStopHandle | undefined;

  const $selfStatus = ref({}) as Ref<$InternalRegleFieldStatus>;
  const $eachStatus = storage.getCollectionsEntry(path);

  immediateScopeState = immediateScope.run(() => {
    const isPrimitiveArray = computed(() => {
      if (!state.value?.length) {
        return false;
      }
      if (Array.isArray(state.value) && state.value.length) {
        return state.value.every((s) => typeof s !== 'object');
      } else if (rulesDef.value.$each && !(rulesDef.value.$each instanceof Function)) {
        return Object.values(rulesDef.value.$each).every((rule) => isRuleDef(rule) || typeof rule === 'function');
      }
      return false;
    });

    return {
      isPrimitiveArray,
    } satisfies ImmediateScopeReturnState;
  })!;

  createStatus();
  $watch();

  function createStatus() {
    $localOptions.value = Object.fromEntries(
      Object.entries(rulesDef.value).filter(([ruleKey]) => ruleKey.startsWith('$'))
    );
    if (typeof state.value === 'object') {
      if (state.value != null && !state.value?.$id && state.value !== null) {
        $id.value = randomId();
        Object.defineProperties(state.value, {
          $id: {
            value: $id.value,
            enumerable: false,
            configurable: false,
            writable: false,
          },
        });
      } else if (state.value?.$id) {
        $id.value = state.value.$id;
      }
    }

    $value.value = $selfStatus.value.$value;

    if (Array.isArray(state.value) && !immediateScopeState.isPrimitiveArray.value) {
      $eachStatus.value = state.value
        .filter((value) => typeof value === 'object')
        .map((value, index) => {
          const { scope, unwrapped } = unwrapGetter(
            rulesDef.value.$each,
            toRef(() => value),
            index
          );
          if (scope) {
            collectionScopes.push(scope);
          }

          const initialStateRef = toRef(initialState.value ?? [], index);
          const $externalErrors = toRef(externalErrors?.value ?? {}, `$each`);
          const $schemaErrors = computed(() => schemaErrors?.value?.$each);

          const element = createCollectionElement({
            $id: $id.value,
            path,
            cachePath: path,
            customMessages,
            rules: unwrapped ?? {},
            stateValue: toRef(() => value),
            index,
            options,
            storage,
            externalErrors: $externalErrors,
            schemaErrors: $schemaErrors,
            initialState: initialStateRef,
            shortcuts,
            fieldName,
            schemaMode,
          });

          if (element) {
            return element;
          }
          return null;
        })
        .filter((each) => !!each);
    } else {
      $eachStatus.value = [];
    }

    $selfStatus.value = createReactiveFieldStatus({
      state,
      rulesDef,
      customMessages,
      path,
      cachePath: path,
      storage,
      options,
      externalErrors: toRef(externalErrors?.value ?? {}, `$self`),
      schemaErrors: computed(() => schemaErrors?.value?.$self),
      $isArray: true,
      initialState: initialState,
      shortcuts,
      fieldName,
      schemaMode,
    });
  }

  function updateStatus() {
    if (Array.isArray(state.value) && !immediateScopeState.isPrimitiveArray.value) {
      const previousStatus = cloneDeep($eachStatus.value);

      $eachStatus.value = state.value
        .filter((value) => typeof value === 'object')
        .map((value, index) => {
          const currentValue = toRef(() => value);
          if (value.$id && $eachStatus.value.find((each) => each.$id === value.$id)) {
            const existingStatus = storage.getArrayStatus($id.value, value.$id);
            if (existingStatus) {
              existingStatus.$value = currentValue;
              return existingStatus;
            }
            return null;
          } else {
            const { scope, unwrapped } = unwrapGetter(rulesDef.value.$each, currentValue, index);
            if (scope) {
              collectionScopes.push(scope);
            }
            const $externalErrors = toRef(externalErrors?.value ?? {}, `$each`);
            const $schemaErrors = computed(() => schemaErrors?.value?.$each ?? []);

            const element = createCollectionElement({
              $id: $id.value,
              path,
              cachePath: path,
              customMessages,
              rules: unwrapped ?? {},
              stateValue: currentValue,
              index,
              options,
              storage,
              externalErrors: $externalErrors,
              schemaErrors: $schemaErrors,
              initialState: toRef(initialState.value ?? [], index),
              shortcuts,
              fieldName,
              schemaMode,
            });
            if (element) {
              return element;
            }
            return null;
          }
        })
        .filter((each) => !!each);

      previousStatus
        .filter(($each) => !state.value?.find((f) => $each.$id === f.$id))
        .forEach((_, index) => {
          storage.deleteArrayStatus($id.value, index.toString());
        });
    } else {
      $eachStatus.value = [];
    }
  }

  function define$watchState() {
    $unwatchState = watch(
      state,
      () => {
        $unwatchDirty?.();
        if (state.value != null && !Object.hasOwn(state.value as any, '$id') && !$id.value) {
          createStatus();
        } else {
          updateStatus();
        }
        define$watchDirty();
      },
      { deep: isVueSuperiorOrEqualTo3dotFive ? 1 : true, flush: 'pre' }
    );

    define$watchDirty();
  }

  function define$watchDirty() {
    $unwatchDirty = watch(
      state,
      () => {
        if (scopeState.$autoDirty.value && !scopeState.$silent.value) {
          // Do not watch deep to only track mutation on the object itself on not its children
          $selfStatus.value.$touch(false, true);
        }
      },
      { flush: 'post' }
    );
  }

  function $watch() {
    define$watchState();
    scope = effectScope();
    scopeState = scope.run(() => {
      const $silentValue = computed({
        get: () => state.value,
        set(value) {
          $unwatchState?.();
          $unwatchDirty?.();
          state.value = value;
          define$watchState();
        },
      });

      const $dirty = computed<boolean>(() => {
        return (
          $selfStatus.value.$dirty &&
          (!$eachStatus.value.length ||
            $eachStatus.value.every((statusOrField) => {
              return statusOrField.$dirty;
            }))
        );
      });

      const $anyDirty = computed<boolean>(() => {
        return (
          $selfStatus.value.$anyDirty ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$anyDirty;
          })
        );
      });

      const $invalid = computed<boolean>(() => {
        return (
          $selfStatus.value.$invalid ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$invalid;
          })
        );
      });

      const $correct = computed<boolean>(() => {
        return (
          (isEmpty($selfStatus.value.$rules) ? true : $selfStatus.value.$correct) &&
          (!$eachStatus.value.length ||
            $eachStatus.value.every((statusOrField) => {
              return statusOrField.$correct || (statusOrField.$anyDirty && !statusOrField.$invalid);
            }))
        );
      });

      const $error = computed<boolean>(() => {
        return (
          $selfStatus.value.$error ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$error;
          })
        );
      });

      const $ready = computed<boolean>(() => {
        return !($invalid.value || $pending.value);
      });

      const $pending = computed<boolean>(() => {
        return (
          $selfStatus.value.$pending ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$pending;
          })
        );
      });

      const $edited = computed<boolean>(() => {
        return (
          !!$eachStatus.value.length &&
          $eachStatus.value.every((statusOrField) => {
            return statusOrField.$edited;
          })
        );
      });

      const $anyEdited = computed<boolean>(() => {
        return (
          $selfStatus.value.$anyEdited ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$anyEdited;
          })
        );
      });

      const $issues = computed(() => {
        return {
          $self: $selfStatus.value.$issues,
          $each: $eachStatus.value.map(($each) => $each.$issues as any),
        } satisfies $InternalRegleCollectionIssues;
      });

      const $errors = computed(() => {
        return {
          $self: $selfStatus.value.$errors,
          $each: $eachStatus.value.map(($each) => $each.$errors),
        } satisfies $InternalRegleCollectionErrors;
      });

      const $silentErrors = computed(() => {
        return {
          $self: $selfStatus.value.$silentErrors,
          $each: $eachStatus.value.map(($each) => $each.$silentErrors),
        } satisfies $InternalRegleCollectionErrors;
      });

      const $rewardEarly = computed<boolean>(() => {
        if ($localOptions.value.$rewardEarly != null) {
          return $localOptions.value.$rewardEarly;
        } else if (unref(options.rewardEarly) != null) {
          return unref(options.rewardEarly);
        }
        return false;
      });
      const $silent = computed<boolean>(() => {
        if ($rewardEarly.value) {
          return true;
        } else if ($localOptions.value.$silent != null) {
          return $localOptions.value.$silent;
        } else if (unref(options.silent) != null) {
          return unref(options.silent);
        } else return false;
      });

      const $autoDirty = computed<boolean>(() => {
        if ($localOptions.value.$autoDirty != null) {
          return $localOptions.value.$autoDirty;
        } else if (unref(options.autoDirty) != null) {
          return unref(options.autoDirty);
        }
        return true;
      });

      const $name = computed(() => fieldName);

      function processShortcuts() {
        if (shortcuts?.collections) {
          Object.entries(shortcuts?.collections).forEach(([key, value]) => {
            const scope = effectScope();

            $shortcuts[key] = scope.run(() => {
              const result = ref();

              watchEffect(() => {
                result.value = value(
                  reactive({
                    $dirty,
                    $error,
                    $path: path,
                    $silentValue: $silentValue as any,
                    $pending,
                    $invalid,
                    $correct,
                    $errors: $errors as any,
                    $silentErrors: $silentErrors as any,
                    $ready,
                    $anyDirty,
                    $name: $name,
                    $each: $eachStatus,
                    $self: $selfStatus as any,
                    $value: state as any,
                    $edited,
                    $anyEdited,
                    $issues: $issues as any,
                  })
                );
              });
              return result;
            })!;

            collectionScopes.push(scope);
          });
        }
      }

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
        $silentValue,
        $edited,
        $anyEdited,
        $rewardEarly,
        $silent,
        $autoDirty,
        $issues,
      } satisfies ScopeReturnState;
    })!;

    if (immediateScopeState.isPrimitiveArray.value && rulesDef.value.$each) {
      console.warn(
        `${path} is a Array of primitives. Tracking can be lost when reassigning the Array. We advise to use an Array of objects instead`
      );
    }
  }

  function $unwatch() {
    $unwatchState?.();
    if ($selfStatus.value) {
      $selfStatus.value.$unwatch();
    }
    if ($eachStatus.value) {
      $eachStatus.value.forEach((element) => {
        if ('$dirty' in element) {
          element.$unwatch();
        }
      });
    }
    scope.stop();
    scope = effectScope();
    immediateScope.stop();
    immediateScope = effectScope(true);
    collectionScopes.forEach((s) => s.stop());
    collectionScopes = [];
  }

  function $touch(runCommit = true, withConditions = false): void {
    $selfStatus.value.$touch(runCommit, withConditions);
    $eachStatus.value.forEach(($each) => {
      $each.$touch(runCommit, withConditions);
    });
  }

  function $reset(options?: ResetOptions<unknown[]>, fromParent?: boolean): void {
    $unwatch();

    if (!fromParent) {
      if (options?.toInitialState) {
        state.value = cloneDeep(initialState.value) as any[];
      } else if (options?.toState) {
        let newInitialState: unknown[];
        if (typeof options?.toState === 'function') {
          newInitialState = options?.toState();
        } else {
          newInitialState = options?.toState;
        }
        initialState.value = cloneDeep(newInitialState);
        state.value = cloneDeep(newInitialState) as any[] & StateWithId;
      } else {
        initialState.value = cloneDeep(state.value) as any[] & StateWithId;
      }
    }

    if (options?.clearExternalErrors) {
      $clearExternalErrors();
    }

    $selfStatus.value.$reset(options, fromParent);
    $eachStatus.value.forEach(($each) => {
      $each.$reset(options, true);
    });

    if (!fromParent) {
      createStatus();
    }
  }

  async function $validate(): Promise<$InternalRegleResult> {
    const data = state.value;
    try {
      const results = await Promise.allSettled([
        $selfStatus.value.$validate(),
        ...$eachStatus.value.map((status) => {
          return status.$validate();
        }),
      ]);

      const validationResults = results.every((value) => {
        if (value.status === 'fulfilled') {
          return value.value.valid === true;
        } else {
          return false;
        }
      });
      return { valid: validationResults, data };
    } catch (e) {
      return { valid: false, data };
    }
  }

  function $clearExternalErrors() {
    $selfStatus.value.$clearExternalErrors();
    $eachStatus.value.forEach(($each) => {
      $each.$clearExternalErrors();
    });
  }

  function $extractDirtyFields(filterNullishValues: boolean = true): any[] {
    let dirtyFields = $eachStatus.value.map(($each) => {
      if (isNestedRulesStatus($each)) {
        return $each.$extractDirtyFields(filterNullishValues);
      }
    });

    if (filterNullishValues) {
      if (
        dirtyFields.every((value) => {
          return isEmpty(value);
        })
      ) {
        dirtyFields = [];
      }
    }
    return dirtyFields;
  }

  const { $shortcuts, ...restScopeState } = scopeState;

  return reactive({
    $self: $selfStatus,
    ...restScopeState,
    ...$shortcuts,
    $path: path,
    $each: $eachStatus,
    $value: state,
    $validate,
    $unwatch,
    $watch,
    $touch,
    $reset,
    $extractDirtyFields,
    $clearExternalErrors,
  }) satisfies $InternalRegleCollectionStatus;
}
