import type { Ref } from 'vue';
import { toRef } from 'vue';
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
  stateValue: Ref<StateWithId>;
  rules: $InternalFormPropertyTypes & RegleCollectionRuleDeclKeyProperty;
  externalErrors: Ref<$InternalRegleErrors[] | undefined> | undefined;
  initialState: any[] | undefined;
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
  initialState,
  shortcuts,
  fieldName,
}: CreateCollectionElementArgs): $InternalRegleStatusType | null {
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

  const $status = createReactiveChildrenStatus({
    state: stateValue,
    rulesDef: toRef(() => rules),
    customMessages,
    path: $path,
    storage,
    options,
    externalErrors: toRef(externalErrors?.value ?? [], index),
    initialState: initialState?.[index],
    shortcuts,
    fieldName,
  });

  if ($status) {
    const valueId = stateValue.value?.$id;
    $status.$id = valueId ?? String($fieldId);
    storage.addArrayStatus($id, $status.$id, $status);
  }

  return $status;
}
