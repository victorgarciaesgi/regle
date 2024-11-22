import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, Ref, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, toRef, watch } from 'vue';
import type {
  $InternalExternalRegleErrors,
  $InternalFormPropertyTypes,
  $InternalRegleCollectionErrors,
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  DeepMaybeRef,
  RegleBehaviourOptions,
  RegleCollectionRuleDeclKeyProperty,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { cloneDeep, randomId, unwrapGetter } from '../../../utils';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../utils/version-compare';
import type { RegleStorage } from '../../useStorage';
import { isExternalErrorCollection, isRuleDef } from '../guards';
import { extractCollectionError, extractRulesErrors } from '../useErrors';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveChildrenStatus } from './createReactiveNestedStatus';

type StateWithId = unknown & { $id?: string };

function createCollectionElement({
  $id,
  path,
  index,
  options,
  storage,
  stateValue,
  customMessages,
  rules,
  externalErrors,
}: {
  $id: string;
  path: string;
  index: number;
  stateValue: Ref<StateWithId>;
  customMessages?: CustomRulesDeclarationTree;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
  rules: $InternalFormPropertyTypes & RegleCollectionRuleDeclKeyProperty;
  externalErrors: ComputedRef<$InternalExternalRegleErrors[] | undefined>;
}): $InternalRegleStatusType | null {
  const $fieldId = rules.$key ? rules.$key : randomId();
  let $path = `${path}.${String($fieldId)}`;

  if (typeof stateValue.value === 'object' && stateValue.value != null) {
    if (!stateValue.value.$id) {
      Object.defineProperties(stateValue.value, {
        $id: {
          value: $fieldId,
          enumerable: false,
          configurable: false,
          writable: false,
        },
      });
    } else {
      $path = `${path}.${stateValue.value.$id}`;
    }
  }

  const $externalErrors = toRef(() => externalErrors.value?.[index]);

  const $status = createReactiveChildrenStatus({
    state: stateValue,
    rulesDef: toRef(() => rules),
    customMessages,
    path: $path,
    storage,
    options,
    externalErrors: $externalErrors,
  });

  if ($status) {
    const valueId = stateValue.value?.$id;
    $status.$id = valueId ?? String($fieldId);
    storage.addArrayStatus($id, $status.$id, $status);
  }

  return $status;
}

interface CreateReactiveCollectionStatusArgs {
  state: Ref<StateWithId[] & StateWithId>;
  rulesDef: Ref<$InternalRegleCollectionRuleDecl>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  index?: number;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Readonly<Ref<$InternalExternalRegleErrors | undefined>>;
}

interface ScopeReturnState {
  $dirty: ComputedRef<boolean>;
  $anyDirty: ComputedRef<boolean>;
  $invalid: ComputedRef<boolean>;
  $valid: ComputedRef<boolean>;
  $error: ComputedRef<boolean>;
  $pending: ComputedRef<boolean>;
  $errors: ComputedRef<$InternalRegleCollectionErrors>;
  $silentErrors: ComputedRef<$InternalRegleCollectionErrors>;
}

interface ImmediateScopeReturnState {
  isPrimitiveArray: ComputedRef<boolean>;
  $externalErrorsField: ComputedRef<string[]>;
  $externalErrorsEach: ComputedRef<$InternalExternalRegleErrors[]>;
}

export function createReactiveCollectionStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
  externalErrors,
}: CreateReactiveCollectionStatusArgs): $InternalRegleCollectionStatus | null {
  let scope = effectScope();
  let scopeState!: ScopeReturnState;

  let immediateScope = effectScope();
  let immediateScopeState!: ImmediateScopeReturnState;

  if (Array.isArray(state.value) && !rulesDef.value.$each) {
    return null;
  }
  const $id = ref<string>() as Ref<string>;
  const $value = ref(state.value);

  let $unwatchState: WatchStopHandle;

  const $fieldStatus = ref({}) as Ref<$InternalRegleFieldStatus>;
  const $eachStatus = storage.getCollectionsEntry(path);

  immediateScopeState = immediateScope.run(() => {
    const isPrimitiveArray = computed(() => {
      if (Array.isArray(state.value) && state.value.length) {
        return state.value.some((s) => typeof s !== 'object');
      } else if (rulesDef.value.$each && !(rulesDef.value.$each instanceof Function)) {
        return Object.values(rulesDef.value.$each).every((rule) => isRuleDef(rule));
      }
      return false;
    });

    const $externalErrorsField = computed<string[]>(() => {
      if (externalErrors.value) {
        if (isExternalErrorCollection(externalErrors.value)) {
          return externalErrors.value.$errors ?? [];
        }
        return [];
      }
      return [];
    });

    const $externalErrorsEach = computed<$InternalExternalRegleErrors[]>(() => {
      if (externalErrors.value) {
        if (isExternalErrorCollection(externalErrors.value)) {
          return externalErrors.value.$each ?? [];
        }
        return [];
      }
      return [];
    });
    return {
      isPrimitiveArray,
      $externalErrorsField,
      $externalErrorsEach,
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

    $value.value = $fieldStatus.value.$value;

    if (Array.isArray(state.value) && rulesDef.value.$each) {
      $eachStatus.value = state.value
        .map((value, index) => {
          const unwrapped$Each = unwrapGetter(
            rulesDef.value.$each,
            toRef(() => value),
            index
          );
          if (unwrapped$Each) {
            const element = createCollectionElement({
              $id: $id.value,
              path,
              rules: unwrapped$Each,
              stateValue: toRef(() => value),
              index,
              options,
              storage,
              externalErrors: immediateScopeState.$externalErrorsEach,
            });
            if (element) {
              return element;
            }
            return null;
          }
        })
        .filter((each) => !!each);
    } else {
      $eachStatus.value = [];
    }

    $fieldStatus.value = createReactiveFieldStatus({
      state,
      rulesDef,
      customMessages,
      path,
      storage,
      options,
      externalErrors: immediateScopeState.$externalErrorsField,
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
            const unwrapped$Each = unwrapGetter(rulesDef.value.$each, currentValue, index);
            if (unwrapped$Each) {
              const element = createCollectionElement({
                $id: $id.value,
                path,
                rules: unwrapped$Each,
                stateValue: currentValue,
                index,
                options,
                storage,
                externalErrors: immediateScopeState.$externalErrorsEach,
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
        .filter(($each) => !state.value.find((f) => $each.$id === f.$id))
        .forEach(($each, index) => {
          storage.deleteArrayStatus($id.value, index.toString());
        });
    } else {
      $eachStatus.value = [];
    }
  }

  function $watch() {
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
    scopeState = scope.run(() => {
      const $dirty = computed<boolean>(() => {
        return (
          $fieldStatus.value.$dirty &&
          $eachStatus.value.every((statusOrField) => {
            return statusOrField.$dirty;
          })
        );
      });

      const $anyDirty = computed<boolean>(() => {
        return (
          $fieldStatus.value.$anyDirty ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$dirty;
          })
        );
      });

      const $invalid = computed<boolean>(() => {
        return (
          $fieldStatus.value.$invalid ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$invalid;
          })
        );
      });

      const $valid = computed<boolean>(
        () =>
          $fieldStatus.value.$valid &&
          $eachStatus.value.every((statusOrField) => {
            return statusOrField.$valid;
          })
      );

      const $error = computed<boolean>(() => {
        return (
          $fieldStatus.value.$error ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$error;
          })
        );
      });

      const $pending = computed<boolean>(() => {
        return (
          $fieldStatus.value.$pending ||
          $eachStatus.value.some((statusOrField) => {
            return statusOrField.$pending;
          })
        );
      });

      const $errors = computed<$InternalRegleCollectionErrors>(() => {
        return {
          $errors: $fieldStatus.value.$errors,
          $each: $eachStatus.value.map(($each) => $each.$errors),
        };
      });

      const $silentErrors = computed<$InternalRegleCollectionErrors>(() => {
        return {
          $errors: $fieldStatus.value.$silentErrors,
          $each: $eachStatus.value.map(($each) => $each.$silentErrors),
        };
      });

      return {
        $dirty,
        $anyDirty,
        $invalid,
        $valid,
        $error,
        $pending,
        $errors,
        $silentErrors,
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
    if ($fieldStatus.value) {
      $fieldStatus.value.$unwatch();
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
  }

  function $touch(): void {
    $fieldStatus.value.$touch();
    $eachStatus.value.forEach(($each) => {
      $each.$touch();
    });
  }

  function $reset(): void {
    $fieldStatus.value.$reset();
    $eachStatus.value.forEach(($each) => {
      $each.$reset();
    });
  }

  async function $validate(): Promise<boolean> {
    try {
      const results = await Promise.all([
        $fieldStatus.value.$validate(),
        ...$eachStatus.value.map((rule) => {
          return rule.$validate();
        }),
      ]);
      return results.every((value) => !!value);
    } catch (e) {
      return false;
    }
  }

  function $clearExternalErrors() {
    // TODO clear external errors
  }

  return reactive({
    $field: $fieldStatus,
    ...scopeState,
    $each: $eachStatus,
    $value: state,
    $validate,
    $unwatch,
    $watch,
    $touch,
    $reset,
    $clearExternalErrors,
  }) satisfies $InternalRegleCollectionStatus;
}
