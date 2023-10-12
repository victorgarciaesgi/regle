import { Ref, reactive, ref, toRef, watch } from 'vue';
import type {
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
} from '../../../types';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveChildrenStatus } from './createReactiveNestedStatus';

interface CreateReactiveCollectionStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleCollectionRuleDecl>;
  customMessages: CustomRulesDeclarationTree;
  path: string;
}

export function createReactiveCollectionStatus({
  state,
  rulesDef,
  customMessages,
  path,
}: CreateReactiveCollectionStatusArgs): $InternalRegleCollectionStatus | null {
  if (Array.isArray(state.value) && !rulesDef.value.$each) {
    return null;
  }

  let $unwatchState: (() => void) | null = null;

  const $fieldStatus = ref() as Ref<$InternalRegleFieldStatus>;
  const $eachStatus = ref<Array<$InternalRegleStatusType>>([]);
  createStatus();
  $watch();

  function createStatus() {
    const { $each, ...otherFields } = rulesDef.value;
    $fieldStatus.value = createReactiveFieldStatus({
      state,
      rulesDef: toRef(() => otherFields),
      customMessages,
      path,
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
          });
        })
        .filter((f): f is $InternalRegleStatusType => !!f);
    } else {
      return [];
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
      { deep: true }
    );
  }

  return reactive({
    ...$fieldStatus.value,
    $each: $eachStatus,
    $unwatch,
    $watch,
  }) satisfies $InternalRegleCollectionStatus;
}
