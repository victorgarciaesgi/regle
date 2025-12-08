import type { ComputedRef, Ref } from 'vue';
import { computed, toRef } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleErrors,
  $InternalRegleSchemaErrors,
  $InternalRegleStatusType,
  RegleCollectionRuleDeclKeyProperty,
} from '../../../../types';
import { randomId } from '../../../../utils';
import type { CommonResolverOptions, StateWithId } from '../common/common-types';
import { createReactiveChildrenStatus } from '../createReactiveNestedStatus';
import { isObject } from '../../../../../../shared';

interface CreateCollectionElementArgs extends CommonResolverOptions {
  $id: string;
  index: number;
  stateValue: Ref<StateWithId | undefined>;
  rules: $InternalFormPropertyTypes & RegleCollectionRuleDeclKeyProperty;
  externalErrors: Ref<$InternalRegleErrors[] | string[] | undefined> | undefined;
  schemaErrors: ComputedRef<$InternalRegleSchemaErrors[] | string[] | undefined> | undefined;
  initialState: Ref<unknown>;
  originalState: Record<string, any>;
  schemaMode: boolean | undefined;
}

export function createCollectionElement({
  $id,
  path,
  cachePath,
  index,
  options,
  storage,
  stateValue,
  customMessages,
  rules,
  externalErrors,
  schemaErrors,
  initialState,
  originalState,
  shortcuts,
  fieldName,
  schemaMode,
}: CreateCollectionElementArgs): $InternalRegleStatusType | undefined {
  const $fieldId = stateValue.value?.$id ?? rules.$key ?? randomId();
  let $cachePath = `${cachePath}.${String($fieldId)}`;
  let $path = `${path}.${index}`;

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
    }
  }

  const $externalErrors = toRef(externalErrors?.value ?? [], index);
  const $schemaErrors = computed(() => schemaErrors?.value?.[index]);

  const $status = createReactiveChildrenStatus({
    index,
    state: stateValue,
    rulesDef: toRef(() => rules),
    customMessages,
    path: $path,
    cachePath: $cachePath,
    storage,
    options,
    externalErrors: $externalErrors,
    schemaErrors: $schemaErrors,
    initialState,
    originalState,
    shortcuts,
    fieldName,
    schemaMode,
  });

  if ($status) {
    const valueId = stateValue.value?.$id;
    $status.$id = valueId ?? String($fieldId);
    storage.addArrayStatus($id, $status.$id, $status);
  }

  if (stateValue.value && !isObject(stateValue.value) && schemaMode) {
    $status?.$touch();
  }

  return $status;
}
