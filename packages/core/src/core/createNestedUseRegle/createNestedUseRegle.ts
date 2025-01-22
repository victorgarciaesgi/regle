import type { AllRulesDeclarations } from '../../types';
import type { MergedNestedRegles } from '../mergeRegles';
import { type useRegleFn } from '../useRegle';
import { createUseCollectNestedValidations } from './useCollectNestedValidations';
import { createUseNestedRegleComposable } from './useNestedRegle';

export function createNestedUseRegle<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<AllRulesDeclarations>>,
  TReturnedRegle extends useRegleFn<any, any> = TCustomRegle extends useRegleFn<infer A, infer B>
    ? useRegleFn<A, B, { $dispose: () => void }>
    : useRegleFn<Partial<AllRulesDeclarations>>,
>(
  customUseRegle?: TCustomRegle
): {
  useNestedRegle: TReturnedRegle;
  useCollectNestedValidations<TValue extends Record<string, any> = Record<string, unknown>>(): {
    r$: MergedNestedRegles<TValue>;
  };
} {
  const { instances, useNestedRegle } = createUseNestedRegleComposable(customUseRegle);

  const { useCollectNestedValidations } = createUseCollectNestedValidations(instances);

  return {
    useNestedRegle: useNestedRegle as unknown as TReturnedRegle,
    useCollectNestedValidations,
  };
}
