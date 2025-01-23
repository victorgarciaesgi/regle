import { ref, type Ref } from 'vue';
import type { AllRulesDeclarations, SuperCompatibleRegleRoot } from '../../types';
import { createGlobalState } from '../../utils';
import type { MergedScopedRegles } from '../mergeRegles';
import { type useRegleFn } from '../useRegle';
import { createUseCollectScopedValidations } from './useCollectScopedValidations';
import { createUseScopedRegleComposable } from './useScopedRegle';

export function createScopedUseRegle<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<AllRulesDeclarations>>,
  TReturnedRegle extends useRegleFn<any, any> = TCustomRegle extends useRegleFn<infer A, infer B>
    ? useRegleFn<A, B, { $dispose: () => void }>
    : useRegleFn<Partial<AllRulesDeclarations>>,
>(options?: {
  customUseRegle?: TCustomRegle;
  customStore?: Ref<Record<string, SuperCompatibleRegleRoot>>;
}): {
  useScopedRegle: TReturnedRegle;
  useCollectScopedValidations<TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(): {
    r$: MergedScopedRegles<TValue>;
  };
} {
  const useInstances = options?.customStore
    ? () => options.customStore!
    : createGlobalState(() => {
        const $inst = ref<Record<string, SuperCompatibleRegleRoot>>({});
        return $inst;
      });
  const instances = useInstances();

  const { useScopedRegle } = createUseScopedRegleComposable(useInstances, options?.customUseRegle);
  const { useCollectScopedValidations } = createUseCollectScopedValidations(instances);

  return {
    useScopedRegle: useScopedRegle as unknown as TReturnedRegle,
    useCollectScopedValidations: useCollectScopedValidations,
  };
}
