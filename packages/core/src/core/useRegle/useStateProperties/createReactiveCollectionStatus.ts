import { RequiredDeep } from 'type-fest';
import { Ref, reactive, ref, toRef, toRefs, watch } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  RegleBehaviourOptions,
} from '../../../types';
import { DeepMaybeRef } from '../../../types';
import { RegleStorage } from '../../useStorage';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveChildrenStatus } from './createReactiveNestedStatus';
import { randomId } from '../../../utils/randomId';

interface CreateReactiveCollectionStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleCollectionRuleDecl>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
}

function createCollectionElement({
  path,
  index,
  options,
  storage,
  value,
  customMessages,
  rules,
}: {
  path: string;
  index: number;
  value: any[];
  customMessages?: CustomRulesDeclarationTree;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
  rules: $InternalFormPropertyTypes;
}): $InternalRegleStatusType | null {
  const $path = `${path}.${index}`;
  const $id = randomId();

  if (!value[index].$id) {
    Object.defineProperties(value[index], {
      $id: {
        value: $id,
      },
    });
  }

  const $state = toRefs(value);
  const $status = createReactiveChildrenStatus({
    state: $state[index],
    rulesDef: toRef(() => rules),
    customMessages,
    path: $path,
    storage,
    options,
  });

  if ($status) {
    $status.$id = value[index].$id ?? $id;
    storage.addArrayStatus($status.$id!, $status);
  }

  return $status;
}

export function createReactiveCollectionStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
  options,
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
    $fieldStatus.value = createReactiveFieldStatus({
      state,
      rulesDef: toRef(() => otherFields),
      customMessages,
      path,
      storage,
      options,
    });

    if (Array.isArray(state.value) && $each) {
      $eachStatus.value = state.value
        .map((value, index) => {
          return createCollectionElement({
            path,
            rules: $each,
            value: state.value as any[],
            index,
            options,
            storage,
          });
        })
        .filter((f): f is $InternalRegleStatusType => !!f);
    } else {
      $eachStatus.value = [];
    }
  }

  function updateChildrenStatus() {
    const { $each } = rulesDef.value;
    if (Array.isArray(state.value) && $eachStatus.value && $each) {
      state.value.forEach((value, index) => {
        if (value.$id) {
          const previousStatus = storage.getArrayStatus(value.$id);
          if (previousStatus) {
            $eachStatus.value[index] = previousStatus;
          }
        } else {
          const newElement = createCollectionElement({
            value: state.value as any[],
            rules: $each,
            customMessages,
            path,
            storage,
            options,
            index,
          });
          if (newElement) {
            $eachStatus.value[index] = newElement;
          }
        }
      });
    }

    // cleanup removed elements from array

    if ($eachStatus.value) {
      const deletedItems = $eachStatus.value.filter(($each) => {
        return Array.isArray(state.value) && !state.value.find((val) => val.$id === $each.$id);
      });

      deletedItems.forEach((item) => item.$unwatch());
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
    $unwatchState = watch(
      state,
      () => {
        updateChildrenStatus();
      },
      { deep: true, flush: 'sync' }
    );
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
