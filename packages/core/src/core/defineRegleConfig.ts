import type { EmptyObject } from 'type-fest';
import type { AllRulesDeclarations, RegleBehaviourOptions, RegleShortcutDefinition } from '../types';
import { createUseRegleComposable, type useRegleFn } from './useRegle';
import { createInferRuleHelper, type inferRulesFn } from './useRegle/inferRules';

export function defineRegleConfig<
  TShortcuts extends RegleShortcutDefinition<TCustomRules>,
  TCustomRules extends Partial<AllRulesDeclarations> = EmptyObject,
>({
  rules,
  modifiers,
  shortcuts,
}: {
  rules?: () => TCustomRules;
  modifiers?: RegleBehaviourOptions;
  shortcuts?: TShortcuts;
}): {
  useRegle: useRegleFn<TCustomRules, TShortcuts>;
  inferRules: inferRulesFn<TCustomRules>;
} {
  const useRegle = createUseRegleComposable<TCustomRules, TShortcuts>(rules, modifiers, shortcuts as any);
  const inferRules = createInferRuleHelper<TCustomRules>();

  return { useRegle, inferRules };
}
