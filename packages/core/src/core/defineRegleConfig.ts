import type { AllRulesDeclarations, RegleBehaviourOptions } from '../types';
import { createUseRegleComposable } from './useRegle';

export function defineRegleConfig<TCustomRules extends Partial<AllRulesDeclarations>>({
  rules,
  modifiers,
}: {
  rules?: () => TCustomRules;
  modifiers?: RegleBehaviourOptions;
}) {
  const useRegle = createUseRegleComposable<TCustomRules>(rules, modifiers);

  return useRegle;
}
