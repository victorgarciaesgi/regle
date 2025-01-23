import { reactive, ref, watch, type Ref } from 'vue';
import type { SuperCompatibleRegleRoot } from '../../types';
import { createSharedComposable } from '../../utils';
import { mergeRegles, type MergedScopedRegles } from '../mergeRegles';

export function createUseCollectScopedValidations(instances: Ref<Record<string, SuperCompatibleRegleRoot>>): {
  useCollectScopedValidations<TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(): {
    r$: MergedScopedRegles<TValue>;
  };
} {
  function useCollectScopedValidations<TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(): {
    r$: MergedScopedRegles<TValue>;
  } {
    const r$ = ref<MergedScopedRegles>(mergeRegles(instances.value, true));

    const regle = reactive({ r$ });

    watch(
      instances,
      (newInstances) => {
        r$.value = mergeRegles(newInstances, true);
      },
      { deep: true }
    );

    return { r$: regle.r$ as any };
  }

  const globalUseScopedRegle = useCollectScopedValidations;

  return { useCollectScopedValidations: globalUseScopedRegle };
}
