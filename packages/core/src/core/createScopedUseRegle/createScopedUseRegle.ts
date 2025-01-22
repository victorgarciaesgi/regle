import type { AllRulesDeclarations } from '../../types';
import type { MergedScopedRegles } from '../mergeRegles';
import { type useRegleFn } from '../useRegle';
import { createUseCollectScopedValidations } from './useCollectScopedValidations';
import { createUseScopedRegleComposable } from './useScopedRegle';

export function createScopedUseRegle<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<AllRulesDeclarations>>,
  TReturnedRegle extends useRegleFn<any, any> = TCustomRegle extends useRegleFn<infer A, infer B>
    ? useRegleFn<A, B, { $dispose: () => void }>
    : useRegleFn<Partial<AllRulesDeclarations>>,
>(
  customUseRegle?: TCustomRegle
): {
  useScopedRegle: TReturnedRegle;
  useCollectScopedValidations<TValue extends Record<string, any> = Record<string, unknown>>(): {
    r$: MergedScopedRegles<TValue>;
  };
} {
  const { instances, useScopedRegle } = createUseScopedRegleComposable(customUseRegle);

  const { useCollectScopedValidations } = createUseCollectScopedValidations(instances);

  return {
    useScopedRegle: useScopedRegle as unknown as TReturnedRegle,
    useCollectScopedValidations,
  };
}
