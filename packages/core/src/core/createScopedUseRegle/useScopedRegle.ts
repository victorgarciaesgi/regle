import { onScopeDispose, ref, type MaybeRefOrGetter, type Ref } from 'vue';
import type { AllRulesDeclarations, Regle, SuperCompatibleRegleRoot } from '../../types';
import { randomId } from '../../utils';
import { useRegle, type useRegleFn } from '../useRegle';

export function createUseScopedRegleComposable<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<AllRulesDeclarations>>,
>(
  customUseRegle?: TCustomRegle
): {
  useScopedRegle: TCustomRegle;
  instances: Ref<Record<string, SuperCompatibleRegleRoot>>;
} {
  const scopedUseRegle = customUseRegle ?? useRegle;
  const instances = ref<Record<string, SuperCompatibleRegleRoot>>({});

  const useScopedRegle: TCustomRegle = ((
    state: Record<string, unknown>,
    rulesFactory: MaybeRefOrGetter<{}>,
    options: any
  ) => {
    const $id = randomId();

    const { r$ } = scopedUseRegle(state, rulesFactory, options) as unknown as Regle;

    instances.value[$id] = r$;

    onScopeDispose(() => {
      delete instances.value[$id];
    });

    function $dispose() {
      delete instances.value[$id];
    }

    return { r$: r$, $dispose } as Regle;
  }) as any;

  return { useScopedRegle, instances };
}
