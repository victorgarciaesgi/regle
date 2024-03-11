import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, Ref } from 'vue';
import { computed, effectScope, nextTick, reactive, ref, toRef, toRefs, watch } from 'vue';
import type {
  $InternalExternalRegleErrors,
  $InternalFormPropertyTypes,
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  RegleBehaviourOptions,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import type { DeepMaybeRef } from '../../../types';
import { randomId } from '../../../utils/randomId';
import type { RegleStorage } from '../../useStorage';
import { isExternalErrorCollection, isRuleDef } from '../guards';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveChildrenStatus } from './createReactiveNestedStatus';
import { createRule, defineType } from '../../createRule';

function createCollectionElement({
  path,
  index,
  options,
  storage,
  value,
  customMessages,
  rules,
  externalErrors,
}: {
  path: string;
  index: number;
  value: any[];
  customMessages?: CustomRulesDeclarationTree;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
  rules: $InternalFormPropertyTypes;
  externalErrors: Readonly<Ref<$InternalExternalRegleErrors[] | undefined>>;
}): $InternalRegleStatusType | null {
  let $id: string | number = randomId();

  if (typeof value[index] === 'object') {
    if (!value[index].$id) {
      Object.defineProperties(value[index], {
        $id: {
          value: $id,
          enumerable: false,
          configurable: false,
          writable: false,
        },
      });
    }
  } else {
    $id = index;
  }
  const $path = `${path}.${$id}`;

  const $state = toRefs(value);
  const $externalErrors = toRef(() => externalErrors.value?.[index]);
  const $status = createReactiveChildrenStatus({
    state: $state[index],
    rulesDef: toRef(() => rules),
    customMessages,
    path: $path,
    storage,
    options,
    externalErrors: $externalErrors,
  });

  if ($status) {
    const valueId = value[index].$id;
    $status.$id = valueId ?? $id;
    storage.addArrayStatus($status.$id!, $status);
  }

  return $status;
}

interface CreateReactiveCollectionStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleCollectionRuleDecl>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  externalErrors: Readonly<Ref<$InternalExternalRegleErrors | undefined>>;
}

interface ScopeReturnState {
  isPrimitiveArray: ComputedRef<boolean>;
  $dirty: ComputedRef<boolean>;
  $anyDirty: ComputedRef<boolean>;
  $invalid: ComputedRef<boolean>;
  $valid: ComputedRef<boolean>;
  $error: ComputedRef<boolean>;
  $pending: ComputedRef<boolean>;
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
  if (Array.isArray(state.value) && !rulesDef.value.$each) {
    return null;
  }

  let $unwatchState: (() => void) | null = null;

  const $fieldStatus = ref({}) as Ref<$InternalRegleFieldStatus>;
  const $eachStatus = storage.getCollectionsEntry(path);

  $watch();
  createStatus();

  function createStatus() {
    const { $each, $debounce, $autoDirty, $lazy, $rewardEarly, ...otherFields } = rulesDef.value;

    const $externalErrorsField = toRef(() => {
      if (externalErrors.value) {
        if (isExternalErrorCollection(externalErrors.value)) {
          return externalErrors.value.$errors;
        }
      }
    });

    const $externalErrorsEach = toRef(() => {
      if (externalErrors.value) {
        if (isExternalErrorCollection(externalErrors.value)) {
          return externalErrors.value.$each;
        }
      }
    });

    if (scopeState.isPrimitiveArray.value) {
      const rulesDef = toRef(() => {
        if ($each) {
          const eachValidators = Object.fromEntries(
            Object.entries($each).map(([key, rule]) => {
              let validator: (value: any) => any;
              let message: string = 'Error';
              if (typeof rule === 'function') {
                validator = rule;
              } else {
                validator = rule.validator;
                message = rule.message;
              }
              const ruleName = `${key}$each`;
              const newRule = createRule({
                type: defineType<any[]>(ruleName),
                validator: (value) => !!value?.every((val) => validator(val)),
                message,
              });
              return [`${key}$each`, newRule];
            })
          );
          return {
            ...otherFields,
            ...eachValidators,
          };
        }
        return otherFields;
      });
      $fieldStatus.value = createReactiveFieldStatus({
        state,
        rulesDef: rulesDef,
        customMessages,
        path,
        storage,
        options,
        externalErrors: $externalErrorsField,
      });
    } else {
      $fieldStatus.value = createReactiveFieldStatus({
        state,
        rulesDef: toRef(() => otherFields),
        customMessages,
        path,
        storage,
        options,
        externalErrors: $externalErrorsField,
      });

      if (Array.isArray(state.value) && $each) {
        $eachStatus.value = state.value
          .map((value, index) => {
            if (value.$id) {
              const previousStatus = storage.getArrayStatus(value.$id);
              if (previousStatus) {
                return previousStatus;
              }
            } else {
              return createCollectionElement({
                path,
                rules: $each,
                value: state.value as any[],
                index,
                options,
                storage,
                externalErrors: $externalErrorsEach,
              });
            }
          })
          .filter((f): f is $InternalRegleStatusType => !!f);
      } else {
        $eachStatus.value = [];
      }
    }
  }

  async function updateChildrenStatus() {
    const { $each } = rulesDef.value;
    if (Array.isArray(state.value) && $eachStatus.value && $each) {
      $unwatchState?.();

      state.value.forEach((value, index) => {
        const valueId = value.$id;
        const childStatus = $eachStatus.value[index];
        if (valueId && '$dirty' in childStatus) {
          if (
            Array.isArray(state.value) &&
            !state.value.find((val) => {
              const valId = val.$id;
              return valId === childStatus.$id;
            })
          ) {
            childStatus.$unwatch();
          }
          const previousStatus = storage.getArrayStatus(value.$id);
          if (previousStatus) {
            $eachStatus.value[index] = previousStatus;
          } else {
            childStatus.$unwatch();
          }
        } else {
          const $externalErrorsEach = toRef(() => {
            if (externalErrors.value) {
              if ('$each' in externalErrors.value) {
                return externalErrors.value.$each as $InternalExternalRegleErrors[];
              }
            }
          });
          const newElement = createCollectionElement({
            value: state.value as any[],
            rules: $each,
            customMessages,
            path,
            storage,
            options,
            index,
            externalErrors: $externalErrorsEach,
          });
          if (newElement) {
            $eachStatus.value[index] = newElement;
          }
        }
      });
      // cleanup removed elements from array (only if elements are pushed)

      const deletedItems = $eachStatus.value.filter(($each) => {
        return (
          Array.isArray(state.value) &&
          '$dirty' in $each &&
          !state.value.find((val) => {
            return val.$id === $each.$id;
          })
        );
      });
      deletedItems.forEach((item) => {
        if ('$dirty' in item) {
          storage.deleteArrayStatus(item.$id);
          item.$unwatch();
        }
      });
      $eachStatus.value.length = state.value.length;
      nextTick($watch);
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
  }

  function $watch() {
    $unwatchState = watch(() => state.value as any, updateChildrenStatus, {
      flush: 'sync',
      deep: true,
    });
    scopeState = scope.run(() => {
      const isPrimitiveArray = computed(() => {
        if (Array.isArray(state.value) && state.value.length) {
          return state.value.some((s) => typeof s !== 'object');
        }
        if (rulesDef.value.$each) {
          return Object.values(rulesDef.value.$each).every((rule) => isRuleDef(rule));
        }
        return false;
      });

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

      const $valid = computed<boolean>(() => !$invalid.value);

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

      return { isPrimitiveArray, $dirty, $anyDirty, $invalid, $valid, $error, $pending };
    })!;
  }

  function $touch(): void {
    $fieldStatus.value.$touch();
    $eachStatus.value.forEach(($each) => {
      if ('$dirty' in $each) {
        $each.$touch();
      }
    });
  }

  function $reset(): void {
    $fieldStatus.value.$reset();
    $eachStatus.value.forEach(($each) => {
      if ('$dirty' in $each) {
        $each.$reset();
      }
    });
    $fieldStatus.value.$watch();
  }

  async function $validate(): Promise<boolean> {
    try {
      const results = await Promise.all([
        $fieldStatus.value.$validate(),
        ...$eachStatus.value.map((rule) => {
          if ('$dirty' in rule) {
            return rule.$validate();
          }
        }),
      ]);
      return results.every((value) => !!value);
    } catch (e) {
      return false;
    }
  }

  return reactive({
    ...$fieldStatus.value,
    ...scopeState,
    $each: $eachStatus,
    $validate,
    $unwatch,
    $watch,
    $touch,
    $reset,
  }) satisfies $InternalRegleCollectionStatus;
}
