import { Ref, reactive, ref, toRef, watch, watchEffect } from 'vue';
import type {
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
} from '../../../types';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveChildrenStatus } from './createReactiveNestedStatus';
import { RegleStorage } from '../../useStorage';

interface CreateReactiveCollectionStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleCollectionRuleDecl>;
  customMessages?: CustomRulesDeclarationTree;
  path: string;
  storage: RegleStorage;
}

export function createReactiveCollectionStatus({
  state,
  rulesDef,
  customMessages,
  path,
  storage,
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
    });

    if (Array.isArray(state.value) && $each) {
      $eachStatus.value = state.value
        .map((value, index) => {
          const $path = `${path}.${index}`;
          return createReactiveChildrenStatus({
            state: toRef(() => value),
            rulesDef: toRef(() => $each),
            customMessages,
            path: $path,
            storage,
          });
        })
        .filter((f): f is $InternalRegleStatusType => !!f);
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
        element.$unwatch();
      });
    }
  }

  function $watch() {
    $unwatchState = watch(
      state,
      () => {
        createStatus();
      },
      { deep: true, flush: 'sync' }
    );
  }

  return reactive({
    ...$fieldStatus.value,
    $each: $eachStatus,
    $unwatch,
    $watch,
  }) satisfies $InternalRegleCollectionStatus;
}
