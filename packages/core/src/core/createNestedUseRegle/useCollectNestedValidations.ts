import { reactive, ref, watch, type Ref } from 'vue';
import type { SuperCompatibleRegleRoot } from '../../types';
import { mergeRegles, type MergedNestedRegles } from '../mergeRegles';

export function createUseCollectNestedValidations(instances: Ref<Record<string, SuperCompatibleRegleRoot>>): {
  useCollectNestedValidations<TValue extends Record<string, any> = Record<string, unknown>>(): {
    r$: MergedNestedRegles<TValue>;
  };
} {
  function useCollectNestedValidations<TValue extends Record<string, any> = Record<string, unknown>>(): {
    r$: MergedNestedRegles<TValue>;
  } {
    const r$ = ref<MergedNestedRegles>(mergeRegles(instances.value, true));

    const regle = reactive({ r$ });

    watch(instances, (newInstances) => {
      r$.value = mergeRegles(newInstances, true);
    });

    return { r$: regle.r$ as any };
  }

  return { useCollectNestedValidations };
}
