// eslint-disable-next-line vue/prefer-import-from-vue
import { pauseTracking, resetTracking } from '@vue/reactivity';
import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, Ref } from 'vue';
import { computed, effectScope, reactive, ref, toRaw, toRef, toRefs, watch } from 'vue';
import type {
  $InternalExternalRegleErrors,
  $InternalFormPropertyTypes,
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  DeepMaybeRef,
  MaybeGetter,
  RegleBehaviourOptions,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { isObject } from '../../../utils';
import { randomId } from '../../../utils/randomId';
import type { RegleStorage } from '../../useStorage';
import {
  isCollectionRulesStatus,
  isExternalErrorCollection,
  isFieldStatus,
  isNestedRulesStatus,
  isRuleDef,
} from '../guards';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveChildrenStatus } from './createReactiveNestedStatus';

function createCollectionElement({
  $id,
  path,
  index,
  options,
  storage,
  value,
  customMessages,
  rules,
  externalErrors,
}: {
  $id: string;
  path: string;
  index: number;
  value: any[];
  customMessages?: CustomRulesDeclarationTree;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
  rules: MaybeGetter<$InternalFormPropertyTypes, any>;
  externalErrors: Readonly<Ref<$InternalExternalRegleErrors[] | undefined>>;
}): $InternalRegleStatusType | null {
  const $fieldId = randomId();
  let $path = `${path}.${$fieldId}`;

  if (typeof value[index] === 'object' && value[index] != null) {
    if (!value[index].$id) {
      Object.defineProperties(value[index], {
        $id: {
          value: $fieldId,
          enumerable: false,
          configurable: false,
          writable: false,
        },
      });
    } else {
      $path = `${path}.${value[index].$id}`;
    }
  }

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
    const valueId = value[index]?.$id;
    $status.$id = valueId ?? $fieldId;
    storage.addArrayStatus($id, index.toString(), $status);
  }

  return $status;
}

function updateCollectionElement({
  path,
  index,
  options,
  storage,
  value,
  customMessages,
  rules,
  externalErrors,
}: {
  $id: string;
  path: string;
  index: number;
  value: any[];
  customMessages?: CustomRulesDeclarationTree;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
  rules: MaybeGetter<$InternalFormPropertyTypes, any>;
  externalErrors: Readonly<Ref<$InternalExternalRegleErrors[] | undefined>>;
}): $InternalRegleStatusType | null {
  const $state = toRefs(value);
  const $externalErrors = toRef(() => externalErrors.value?.[index]);

  const $status = createReactiveChildrenStatus({
    state: $state[index],
    rulesDef: toRef(() => rules),
    customMessages,
    path,
    storage,
    options,
    externalErrors: $externalErrors,
  });

  return $status;
}

interface CreateReactiveCollectionStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleCollectionRuleDecl>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  index?: number;
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
  const $id = ref<string>() as Ref<string>;
  const $value = ref(state.value);

  let $unwatchState: (() => void) | null = null;

  const $fieldStatus = ref({}) as Ref<$InternalRegleFieldStatus>;
  const $eachStatus = storage.getCollectionsEntry(path);

  $watch();
  createStatus();

  function createStatus() {
    if (typeof state.value === 'object') {
      if (state.value != null && !(state.value as any)?.$id && state.value !== null) {
        $id.value = randomId();
        Object.defineProperties(state.value, {
          $id: {
            value: $id.value,
            enumerable: false,
            configurable: false,
            writable: false,
          },
        });
      } else {
        $id.value = (state.value as any)?.$id;
      }
    }
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

    if (Array.isArray(state.value)) {
      const instrumentations: Record<string, Function> = {};
      // TODO warn that reassing the array will lost track of previous rule states (even with filter, reduce etc..)
      (['pop', 'shift', 'unshift', 'splice'] as const).forEach((key) => {
        instrumentations[key] = function (this: unknown[], ...args: [...any[]]) {
          pauseTracking();

          $eachStatus.value.forEach((status) => {
            status.$unwatch();
            storage.deleteArrayStatus($id.value, status.$id);
          });
          // @ts-ignore
          $eachStatus.value[key](...args);

          const res = (Object.assign([], this) as any)[key].apply(this, args);

          $eachStatus.value = $eachStatus.value
            .map((status, newIndex) => {
              if (
                isObject(status) &&
                (isFieldStatus(status) ||
                  isCollectionRulesStatus(status) ||
                  isNestedRulesStatus(status)) &&
                status.$id != null
              ) {
                return updateCollectionElement({
                  $id: $id.value,
                  path: `${path}.${status.$id}`,
                  rules: $each!,
                  value: state.value as any[],
                  index: newIndex,
                  options,
                  storage,
                  externalErrors: $externalErrorsEach,
                });
              } else {
                return createCollectionElement({
                  $id: $id.value,
                  path,
                  rules: $each!,
                  value: state.value as any[],
                  index: newIndex,
                  options,
                  storage,
                  externalErrors: $externalErrorsEach,
                });
              }
            })
            .filter((f): f is $InternalRegleStatusType => !!f);

          resetTracking();

          return res;
        };
      });

      const watchableState = new Proxy(toRaw(state.value) as any[], {
        get(target, prop, receiver) {
          const result = Reflect.get(target, prop, receiver);
          if (typeof prop === 'symbol') return result;
          if (Array.isArray(target) && Object.hasOwn(instrumentations, prop)) {
            return Reflect.get(instrumentations, prop, receiver);
          }
          return result;
        },
        deleteProperty(target, key) {
          const result = Reflect.deleteProperty(target, key);
          if (typeof key === 'symbol') return true;
          if (!isNaN(parseInt(key))) {
            $eachStatus.value.splice(parseInt(key), 1);
            storage.deleteArrayStatus($id.value, key);
          }
          return result;
        },
        set(target, key, value) {
          const result = Reflect.set(target, key, value);

          // console.log(`set key ${key as string} with value ${value}`);
          if (typeof key === 'symbol') return true;
          if (!isNaN(parseInt(key))) {
            const index = parseInt(key);
            const existingStatus = $eachStatus.value[index];

            if (!existingStatus && rulesDef.value.$each) {
              const newElement = createCollectionElement({
                $id: $id.value,
                value: state.value as any[],
                rules: rulesDef.value.$each,
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
          }

          return result;
        },
      });
      pauseTracking();
      state.value = watchableState;
      resetTracking();
    }
    $fieldStatus.value = createReactiveFieldStatus({
      state,
      rulesDef: toRef(() => otherFields),
      customMessages,
      path,
      storage,
      options,
      externalErrors: $externalErrorsField,
    });

    $value.value = $fieldStatus.value.$value;

    if (Array.isArray(state.value) && $each) {
      for (const [index, s] of state.value.entries()) {
        const element = createCollectionElement({
          $id: $id.value,
          path,
          rules: $each,
          value: state.value as any[],
          index,
          options,
          storage,
          externalErrors: $externalErrorsEach,
        });
        if (element) {
          $eachStatus.value[index] = element;
        }
      }
    } else {
      $eachStatus.value = [];
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
    $unwatchState = watch(state, () => {
      if (state.value != null && !Object.hasOwn(state.value as any, '$id')) {
        createStatus();
      }
    });
    scopeState = scope.run(() => {
      const isPrimitiveArray = computed(() => {
        if (Array.isArray(state.value) && state.value.length) {
          return state.value.some((s) => typeof s !== 'object');
        } else if (rulesDef.value.$each) {
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
    $value,
    ...scopeState,
    $each: $eachStatus,
    $validate,
    $unwatch,
    $watch,
    $touch,
    $reset,
  }) satisfies $InternalRegleCollectionStatus;
}
