import type { ComputedRef, Ref } from 'vue';
import { computed, toRef } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleErrors,
  $InternalRegleStatusType,
  RegleCollectionRuleDeclKeyProperty,
} from '../../../../types';
import { randomId } from '../../../../utils';
import type { CommonResolverOptions, StateWithId } from '../common/common-types';
import { createReactiveChildrenStatus } from '../createReactiveNestedStatus';

interface CreateCollectionElementArgs extends CommonResolverOptions {
  $id: string;
  index: number;
  stateValue: Ref<StateWithId | undefined>;
  rules: $InternalFormPropertyTypes & RegleCollectionRuleDeclKeyProperty;
  externalErrors: Ref<$InternalRegleErrors[] | string[] | undefined> | undefined;
  schemaErrors: ComputedRef<$InternalRegleErrors[] | string[] | undefined> | undefined;
  initialState: Ref<unknown>;
  schemaMode: boolean | undefined;
}

export function createCollectionElement({
  $id,
  path,
  index,
  options,
  storage,
  stateValue,
  customMessages,
  rules,
  externalErrors,
  schemaErrors,
  initialState,
  shortcuts,
  fieldName,
  schemaMode,
}: CreateCollectionElementArgs): $InternalRegleStatusType | undefined {
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

  const $externalErrors = toRef(externalErrors?.value ?? [], index);
  const $schemaErrors = computed(() => schemaErrors?.value?.[index]);

  const $status = createReactiveChildrenStatus({
    state: stateValue,
    rulesDef: toRef(() => rules),
    customMessages,
    path: $path,
    storage,
    options,
    externalErrors: $externalErrors,
    schemaErrors: $schemaErrors,
    initialState,
    shortcuts,
    fieldName,
    schemaMode,
  });

  if ($status) {
    const valueId = stateValue.value?.$id;
    $status.$id = valueId ?? String($fieldId);
    storage.addArrayStatus($id, $status.$id, $status);
  }

  return $status;
}
