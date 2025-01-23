import type { AllRulesDeclarations, RegleBehaviourOptions, RegleShortcutDefinition } from '../types';
import { createUseRegleComposable, type useRegleFn } from './useRegle';
import { createInferRuleHelper, type inferRulesFn } from './useRegle/inferRules';

/**
 * Define a global regle configuration, where you can:
 * - Customize buil-in rules messages
 * - Add your custom rules
 * - Define global modifiers
 * - Define shortcuts
 *
 * It will return:
 *
 * - a `useRegle` composable that can typecheck your custom rules
 * - an `inferRules` helper that can typecheck your custom rules
 */
export function defineRegleConfig<
  TShortcuts extends RegleShortcutDefinition<TCustomRules>,
  TCustomRules extends Partial<AllRulesDeclarations>,
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
