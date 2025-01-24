import { ref, type MaybeRefOrGetter, type Ref } from 'vue';
import type { AllRulesDeclarations, ScopedInstancesRecord, SuperCompatibleRegleRoot } from '../../types';
import { createGlobalState } from '../../utils';
import type { MergedScopedRegles } from '../mergeRegles';
import { type useRegleFn } from '../useRegle';
import { createUseCollectScope } from './useCollectScope';
import { createUseScopedRegleComposable } from './useScopedRegle';

export function createScopedUseRegle<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<AllRulesDeclarations>>,
  TReturnedRegle extends useRegleFn<any, any> = TCustomRegle extends useRegleFn<infer A, infer B>
    ? useRegleFn<A, B, { dispose: () => void; register: () => void }, { namespace?: MaybeRefOrGetter<string> }>
    : useRegleFn<Partial<AllRulesDeclarations>>,
>(options?: {
  customUseRegle?: TCustomRegle;
  customStore?: Ref<ScopedInstancesRecord>;
}): {
  useScopedRegle: TReturnedRegle;
  useCollectScope<TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(
    namespace?: MaybeRefOrGetter<string>
  ): {
    r$: MergedScopedRegles<TValue>;
  };
} {
  const useInstances = options?.customStore
    ? () => options.customStore!
    : createGlobalState(() => {
        const $inst = ref<ScopedInstancesRecord>({ '~~global': {} });
        return $inst;
      });

  const instances = useInstances();

  const { useScopedRegle } = createUseScopedRegleComposable(instances, options?.customUseRegle);
  const { useCollectScope } = createUseCollectScope(instances);

  return {
    useScopedRegle: useScopedRegle as unknown as TReturnedRegle,
    useCollectScope: useCollectScope,
  };
}
