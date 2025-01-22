import { reactive, ref, watch, type Ref } from 'vue';
import type { SuperCompatibleRegleRoot } from '../../types';
import { mergeRegles, type MergedScopedRegles } from '../mergeRegles';

export function createUseCollectScopedValidations(instances: Ref<Record<string, SuperCompatibleRegleRoot>>): {
  useCollectScopedValidations<TValue extends Record<string, any> = Record<string, unknown>>(): {
    r$: MergedScopedRegles<TValue>;
  };
} {
  function useCollectScopedValidations<TValue extends Record<string, any> = Record<string, unknown>>(): {
    r$: MergedScopedRegles<TValue>;
  } {
    const r$ = ref<MergedScopedRegles>(mergeRegles(instances.value, true));

    const regle = reactive({ r$ });

    watch(instances, (newInstances) => {
      r$.value = mergeRegles(newInstances, true);
    });

    return { r$: regle.r$ as any };
  }

  return { useCollectScopedValidations };
}
