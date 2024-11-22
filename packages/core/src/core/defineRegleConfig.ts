import type { AllRulesDeclarations, RegleBehaviourOptions } from '../types';
import { createUseRegleComposable } from './useRegle';
import { createInferRuleHelper } from './useRegle/inferRules';

export function defineRegleConfig<TCustomRules extends Partial<AllRulesDeclarations>>({
  rules,
  modifiers,
}: {
  rules?: () => TCustomRules;
  modifiers?: RegleBehaviourOptions;
}) {
  const useRegle = createUseRegleComposable<TCustomRules>(rules, modifiers);
  const inferRules = createInferRuleHelper<TCustomRules>();

  return { useRegle, inferRules };
}
