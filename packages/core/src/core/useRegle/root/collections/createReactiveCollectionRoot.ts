import type { ComputedRef, EffectScope, Ref, ToRefs, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, watch, watchEffect } from 'vue';
import { cloneDeep, isEmpty } from '../../../../../../shared';
import type {
  $InternalRegleCollectionErrors,
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleResult,
  CustomRulesDeclarationTree,
  RegleShortcutDefinition,
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
  initialState: Ref<(unknown | undefined)[]>;
  shortcuts: RegleShortcutDefinition | undefined;
}

export function createReactiveCollectionStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
  externalErrors,
  initialState,
  shortcuts,
  fieldName,
}: CreateReactiveCollectionStatusArgs): $InternalRegleCollectionStatus | undefined {
  interface ScopeReturnState extends CommonResolverScopedState {
    $dirty: ComputedRef<boolean>;
    $errors: ComputedRef<$InternalRegleCollectionErrors>;
    $silentErrors: ComputedRef<$InternalRegleCollectionErrors>;
    $ready: ComputedRef<boolean>;
    $shortcuts: ToRefs<RegleShortcutDefinition['collections']>;
    $silentValue: ComputedRef<any>;
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

  let $unwatchState: WatchStopHandle;

  const $selfStatus = ref({}) as Ref<$InternalRegleFieldStatus>;
  const $eachStatus = storage.getCollectionsEntry(path);

  immediateScopeState = immediateScope.run(() => {
    const isPrimitiveArray = computed(() => {
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

    if (immediateScopeState.isPrimitiveArray.value) {
      return;
    }

    $value.value = $selfStatus.value.$value;

    if (Array.isArray(state.value)) {
      $eachStatus.value = state.value
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

          const element = createCollectionElement({
            $id: $id.value,
            path,
            customMessages,
            rules: unwrapped ?? {},
            stateValue: toRef(() => value),
            index,
            options,
            storage,
            externalErrors: toRef(externalErrors?.value ?? {}, `$each`),
            initialState: initialStateRef,
            shortcuts,
            fieldName,
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
      storage,
      options,
      externalErrors: toRef(externalErrors?.value ?? {}, `$self`),
      $isArray: true,
      initialState: initialState,
      shortcuts,
      fieldName,
    });
  }

  function updateStatus() {
    if (Array.isArray(state.value)) {
      const previousStatus = cloneDeep($eachStatus.value);

      $eachStatus.value = state.value
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
            if (unwrapped) {
              const element = createCollectionElement({
                $id: $id.value,
                path,
                customMessages,
                rules: unwrapped,
                stateValue: currentValue,
                index,
                options,
                storage,
                externalErrors: toRef(externalErrors?.value ?? {}, `$each`),
                initialState: toRef(initialState.value ?? [], index),
                shortcuts,
                fieldName,
              });
              if (element) {
                return element;
              }
              return null;
            }
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
        if (state.value != null && !Object.hasOwn(state.value as any, '$id')) {
          createStatus();
        } else {
          updateStatus();
        }
      },
      { deep: isVueSuperiorOrEqualTo3dotFive ? 1 : true, flush: 'pre' }
    );
  }

  function $watch() {
    define$watchState();
    scope = effectScope();
    scopeState = scope.run(() => {
      const $silentValue = computed({
        get: () => state.value,
        set(value) {
          $unwatchState();
          state.value = value;
          define$watchState();
        },
      });

      const $dirty = computed<boolean>(() => {
        return (
          $selfStatus.value.$dirty &&
          !!$eachStatus.value.length &&
          $eachStatus.value.every((statusOrField) => {
            return statusOrField.$dirty;
          })
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

      const $valid = computed<boolean>(() => {
        return (
          (isEmpty($selfStatus.value.$rules) ? true : $selfStatus.value.$valid) &&
          $eachStatus.value.every((statusOrField) => {
            return statusOrField.$valid;
          })
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
                    $silentValue: $silentValue as any,
                    $pending,
                    $invalid,
                    $valid,
                    $errors: $errors as any,
                    $ready,
                    $silentErrors: $silentErrors as any,
                    $anyDirty,
                    $name: $name,
                    $each: $eachStatus,
                    $self: $selfStatus as any,
                    $value: state as any,
                    $edited,
                    $anyEdited,
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
        $valid,
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
      } satisfies ScopeReturnState;
    })!;

    if (immediateScopeState.isPrimitiveArray.value) {
      console.warn(
        `${path} is a Array of primitives. Tracking can be lost when reassigning the Array. We advise to use an Array of objects instead`
      );
      $unwatchState();
    }
  }

  function $unwatch() {
    if ($unwatchState) {
      $unwatchState();
    }
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

  function $reset(): void {
    $selfStatus.value.$reset();
    $eachStatus.value.forEach(($each) => {
      $each.$reset();
    });
  }

  async function $validate(): Promise<$InternalRegleResult> {
    const data = state.value;
    try {
      const results = await Promise.allSettled([
        $selfStatus.value.$validate(),
        ...$eachStatus.value.map((rule) => {
          return rule.$validate();
        }),
      ]);

      const validationResults = results.every((value) => {
        if (value.status === 'fulfilled') {
          return value.value.result === true;
        } else {
          return false;
        }
      });
      return { result: validationResults, data };
    } catch (e) {
      return { result: false, data };
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

  function $resetAll() {
    $unwatch();
    state.value = cloneDeep(initialState.value) as any;
    $reset();
  }

  const { $shortcuts, ...restScopeState } = scopeState;

  return reactive({
    $self: $selfStatus,
    ...restScopeState,
    ...$shortcuts,
    $each: $eachStatus,
    $value: state,
    $validate,
    $unwatch,
    $watch,
    $touch,
    $reset,
    $resetAll,
    $extractDirtyFields,
    $clearExternalErrors,
  }) satisfies $InternalRegleCollectionStatus;
}
