import type { DeepReactiveState, PrimitiveTypes } from '@regle/core';
import type { MaybeRef, Ref } from 'vue';
import { computed, isRef, ref } from 'vue';
import { cloneDeep, isObject } from '../../../../shared';

export function createSchemaState(
  state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>> | PrimitiveTypes
) {
  const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

  const isSingleField = computed(() => !isObject(processedState.value));

  const initialState = ref(
    isObject(processedState.value) ? { ...cloneDeep(processedState.value) } : cloneDeep(processedState.value)
  );

  const originalState = isObject(processedState.value)
    ? { ...cloneDeep(processedState.value) }
    : cloneDeep(processedState.value);

  return {
    processedState,
    isSingleField,
    initialState,
    originalState,
  };
}
