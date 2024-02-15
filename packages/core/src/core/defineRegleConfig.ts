import type { AllRulesDeclarations, RegleBehaviourOptions } from '../types';
import { createUseRegleComposable } from './useRegle';
import type { Ref, ComputedRef } from 'vue';

/**
 * Root function that allows you to define project-wise all your custom validators or overwrite default ones
 *
 * It will return utility functions that let you build type-safe forms
 *
 * @param customRules
 */
export function defineRegleConfig<TCustomRules extends Partial<AllRulesDeclarations>>({
  rules,
  options,
}: {
  rules?: () => TCustomRules;
  options?: RegleBehaviourOptions;
}) {
  const useRegle = createUseRegleComposable<TCustomRules>(rules, options);

  return useRegle;
}
