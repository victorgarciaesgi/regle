import type { ComputedRef, Ref } from 'vue';
import { computed, ref, toRef } from 'vue';
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
import { isStatic } from '../../guards';

/**
 * Per-element current-index trackers. The `Ref<number>` tracks the current position of a
 * given item in its array. `updateStatus` keeps this ref in sync when items are reused
 * across array mutations so that `$schemaErrors` lookups inside the element follow the
 * current location after swaps/reorderings, instead of staying bound to the index that
 * was captured when the element was first created.
 *
 * We can't attach the ref directly on the returned status object because it's wrapped in
 * `reactive()`, which auto-unwraps refs on read (including symbol keys). Instead, each
 * collection passes its own `Map<itemId, Ref<number>>` into `createCollectionElement`
 * via the `currentIndexes` argument.
 */
export type CollectionIndexTrackers = Map<string, Ref<number>>;

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
  /**
   * A `Map<itemId, Ref<number>>` owned by the parent collection. The element registers
   * its current-index ref here so that `updateStatus` can keep it in sync across array
   * mutations.
   */
  currentIndexes?: CollectionIndexTrackers;
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
  overrides,
  currentIndexes,
}: CreateCollectionElementArgs): $InternalRegleStatusType | undefined {
  const $fieldId = stateValue.value?.$id ?? rules.$key ?? randomId();
  let $cachePath = `${cachePath}.${String($fieldId)}`;
  // Reactive index so that `$schemaErrors` lookups follow the element's current position
  // when the array gets mutated (swap/splice). `updateStatus` keeps this in sync through
  // the `currentIndexes` map below.
  const currentIndex = ref(index);
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
  const $schemaErrors = computed(() => schemaErrors?.value?.[currentIndex.value]);

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
    overrides,
  });

  if ($status) {
    const valueId = stateValue.value?.$id;
    $status.$id = valueId ?? String($fieldId);
    currentIndexes?.set($status.$id, currentIndex);
    storage.addArrayStatus($id, $status.$id, $status);
  }

  if (stateValue.value && (!isObject(stateValue.value) || isStatic(stateValue.value)) && schemaMode) {
    $status?.$touch();
  }

  return $status;
}
