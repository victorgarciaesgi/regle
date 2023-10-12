import { ComputedRef, Ref, computed, effectScope, reactive, ref, toRef, toRefs, watch } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleCollectionRuleDecl,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalReglePartialValidationTree,
  $InternalRegleRuleStatus,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  CustomRulesDeclarationTree,
  RegleRuleDecl,
} from '../../../types';
import { isEmpty, isObject, isRefObject } from '../../../utils';
import { useStorage } from '../../useStorage';
import { isCollectionRulesDef, isNestedRulesDef, isValidatorRulesDef } from '../guards';
import { createReactiveRuleStatus } from './createReactiveRuleStatus';
import { createReactiveFieldStatus } from './createReactiveFieldStatus';
import { createReactiveChildrenStatus } from './createReactiveNestedStatus';

interface CreateReactiveCollectionStatusArgs {
  state: Ref<unknown>;
  rulesDef: Ref<$InternalRegleCollectionRuleDecl>;
  customMessages: CustomRulesDeclarationTree;
  path: string;
}

type ScopeReturnState = {
  $each: ComputedRef<$InternalFormPropertyTypes>;
} & {
  [Key in keyof $InternalRegleStatus]?: Ref<$InternalRegleStatus[Key]>;
};

export function createReactiveCollectionStatus({
  state,
  rulesDef,
  customMessages,
  path,
}: CreateReactiveCollectionStatusArgs) {
  const scope = effectScope();
  let scopeState!: ScopeReturnState;

  const $fieldStatus = ref<$InternalRegleFieldStatus | null>(null);
  const $each = ref();
  createFieldStatus();

  function createFieldStatus() {
    const { $each, ...otherFields } = rulesDef.value;
    $fieldStatus.value = createReactiveFieldStatus({
      state,
      rulesDef: toRef(() => otherFields),
      customMessages,
      path,
    });
  }

  function $unwatch() {
    if ($fieldStatus.value) {
      $fieldStatus.value.$unwatch();
    }
    scope.stop();
    scopeState = null as any; // cleanup
  }

  function $watch() {
    scopeState = scope.run(() => {
      const $each = computed(() => rulesDef.value.$each);

      return {
        $each,
      };
    }) as ScopeReturnState;
  }
}
