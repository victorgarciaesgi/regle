import type { Merge } from 'type-fest';
import type { AllRulesDeclarations, RegleBehaviourOptions, RegleShortcutDefinition } from '../types';
import { createUseRegleComposable, type useRegleFn } from './useRegle';
import { createInferRuleHelper, type inferRulesFn } from './useRegle/inferRules';
import { merge } from '../../../shared';

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
  useRegle.__config = { rules, modifiers, shortcuts };

  const inferRules = createInferRuleHelper<TCustomRules>();

  return { useRegle, inferRules };
}

/**
 * Extend an already created custom `useRegle` (as the first parameter)
 *
 * It will return:
 *
 * - a `useRegle` composable that can typecheck your custom rules
 * - an `inferRules` helper that can typecheck your custom rules
 */
export function extendRegleConfig<
  TRootCustomRules extends Partial<AllRulesDeclarations>,
  TRootShortcuts extends RegleShortcutDefinition<{}>,
  TShortcuts extends RegleShortcutDefinition<Merge<TRootCustomRules, TCustomRules>>,
  TCustomRules extends Partial<AllRulesDeclarations>,
>(
  regle: useRegleFn<TRootCustomRules, TRootShortcuts>,
  {
    rules,
    modifiers,
    shortcuts,
  }: {
    rules?: () => TCustomRules;
    modifiers?: RegleBehaviourOptions;
    shortcuts?: TShortcuts;
  }
): {
  useRegle: useRegleFn<Merge<TRootCustomRules, TCustomRules>, TRootShortcuts & TShortcuts>;
  inferRules: inferRulesFn<Merge<TRootCustomRules, TCustomRules>>;
} {
  const rootConfig = regle.__config ?? {};
  const newRules = () => ({ ...rootConfig.rules?.(), ...rules?.() }) as TCustomRules;
  const newModifiers = rootConfig.modifiers && modifiers ? merge(rootConfig.modifiers, modifiers) : modifiers;
  const newShortcuts = rootConfig.shortcuts && shortcuts ? merge(rootConfig.shortcuts, shortcuts) : shortcuts;

  const useRegle = createUseRegleComposable<TCustomRules, TShortcuts>(newRules, newModifiers, newShortcuts as any);
  useRegle.__config = { rules: newRules, modifiers: newModifiers, shortcuts: newShortcuts };

  const inferRules = createInferRuleHelper<TCustomRules>();

  return { useRegle: useRegle as any, inferRules };
}
