import { getCurrentInstance, onMounted, type MaybeRefOrGetter, type Ref } from 'vue';
import type { AllRulesDeclarations, Regle, SuperCompatibleRegleRoot } from '../../types';
import { tryOnScopeDispose } from '../../utils';
import { useRegle, type useRegleFn } from '../useRegle';

export function createUseScopedRegleComposable<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<AllRulesDeclarations>>,
>(
  useInstances: () => Ref<Record<string, SuperCompatibleRegleRoot>>,
  customUseRegle?: TCustomRegle
): {
  useScopedRegle: TCustomRegle;
} {
  const scopedUseRegle = customUseRegle ?? useRegle;

  const useScopedRegle: TCustomRegle = ((
    state: Record<string, unknown>,
    rulesFactory: MaybeRefOrGetter<{}>,
    options: any
  ) => {
    const instances = useInstances();

    const $id = Object.keys(instances.value).length + 1;

    const { r$ } = scopedUseRegle(state, rulesFactory, options) as unknown as Regle;

    instances.value[$id] = r$;

    tryOnScopeDispose(dispose);

    if (getCurrentInstance()) {
      onMounted(() => {
        // Avoid component to be mounted twice on HMR
        const currentInstance = getCurrentInstance();
        if (typeof window !== 'undefined' && currentInstance?.proxy?.$el?.parentElement) {
          if (
            document.documentElement &&
            !document.documentElement.contains(currentInstance?.proxy?.$el?.parentElement)
          ) {
            dispose();
          }
        }
      });
    }

    function dispose() {
      delete instances.value[$id];
    }

    return { r$: r$, dispose } as Regle;
  }) as any;

  return { useScopedRegle };
}
