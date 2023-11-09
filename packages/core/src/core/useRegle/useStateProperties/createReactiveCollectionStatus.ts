import { RequiredDeep } from 'type-fest';
import { Ref, nextTick, reactive, ref, toRef, toRefs, watch } from 'vue';
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
import { DeepMaybeRef } from '../../../types';
import { randomId } from '../../../utils/randomId';
import { RegleStorage } from '../../useStorage';
import { isExternalErrorCollection } from '../guards';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveChildrenStatus } from './createReactiveNestedStatus';

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
  const $id = randomId();
  const $path = `${path}.${$id}`;

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
    $status.$id = value[index].$id ?? $id;
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

export function createReactiveCollectionStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
  externalErrors,
}: CreateReactiveCollectionStatusArgs): $InternalRegleCollectionStatus | null {
  if (Array.isArray(state.value) && !rulesDef.value.$each) {
    return null;
  }

  let $unwatchState: (() => void) | null = null;

  const $fieldStatus = ref({}) as Ref<$InternalRegleFieldStatus>;
  const $eachStatus = storage.getCollectionsEntry(path);

  createStatus();
  $watch();

  function createStatus() {
    const { $each, ...otherFields } = rulesDef.value;

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

  async function updateChildrenStatus() {
    const { $each } = rulesDef.value;
    if (Array.isArray(state.value) && $eachStatus.value && $each) {
      $unwatchState?.();
      state.value.forEach((value, index) => {
        if (value.$id) {
          if (
            Array.isArray(state.value) &&
            !state.value.find((val) => val.$id === $eachStatus.value[index].$id)
          ) {
            $eachStatus.value[index].$unwatch();
          }
          const previousStatus = storage.getArrayStatus(value.$id);
          if (previousStatus) {
            $eachStatus.value[index] = previousStatus;
          } else {
            $eachStatus.value[index].$unwatch();
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
        return Array.isArray(state.value) && !state.value.find((val) => val.$id === $each.$id);
      });
      deletedItems.forEach((item) => {
        storage.deleteArrayStatus(item.$id);
        item.$unwatch();
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
        element.$unwatch();
      });
    }
  }

  function $watch() {
    $unwatchState = watch(() => (state.value as any).length, updateChildrenStatus, {
      flush: 'sync',
    });
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
      const results = await Promise.all(
        $eachStatus.value.map((rule) => {
          return rule.$validate();
        })
      );
      return results.every((value) => !!value);
    } catch (e) {
      return false;
    }
  }

  return reactive({
    ...$fieldStatus.value,
    $each: $eachStatus,
    $validate,
    $unwatch,
    $watch,
    $touch,
    $reset,
  }) satisfies $InternalRegleCollectionStatus;
}
