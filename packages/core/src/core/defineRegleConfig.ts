import type { Merge } from 'type-fest';
import type { ExtendedRulesDeclarations, RegleBehaviourOptions, RegleShortcutDefinition } from '../types';
import { createUseRegleComposable, createUseRulesComposable, type useRegleFn, type useRulesFn } from './useRegle';
import { createInferRuleHelper, type inferRulesFn } from './useRegle/inferRules';
import { merge } from '../../../shared';

/**
 * Define a global Regle configuration to customize the validation behavior across your application.
 *
 * Features:
 * - Customize built-in rules messages
 * - Add your custom rules with full type inference
 * - Define global modifiers (lazy, rewardEarly, etc.)
 * - Define shortcuts for common validation patterns
 *
 * @param options - Configuration options
 * @param options.rules - Factory function returning custom rules
 * @param options.modifiers - Global behavior modifiers
 * @param options.shortcuts - Reusable validation shortcuts
 * @returns Object containing typed `useRegle`, `inferRules`, and `useRules` functions
 *
 * @example
 * ```ts
 * import { defineRegleConfig } from '@regle/core';
 * import { required, withMessage } from '@regle/rules';
 *
 * export const { useRegle, inferRules, useRules } = defineRegleConfig({
 *   rules: () => ({
 *     // Override default required message
 *     required: withMessage(required, 'This field cannot be empty'),
 *     // Add custom rule
 *     myCustomRule: createRule({
 *       validator: (value) => value === 'valid',
 *       message: 'Invalid value'
 *     })
 *   }),
 *   modifiers: {
 *     lazy: true,
 *     rewardEarly: true
 *   }
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/global-config Documentation}
 */
export function defineRegleConfig<
  TShortcuts extends RegleShortcutDefinition<TCustomRules>,
  TCustomRules extends Partial<ExtendedRulesDeclarations>,
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
  useRules: useRulesFn<TCustomRules, TShortcuts>;
} {
  const useRegle = createUseRegleComposable<TCustomRules, TShortcuts>(rules, modifiers, shortcuts as any);
  const useRules = createUseRulesComposable<TCustomRules, TShortcuts>(rules, modifiers, shortcuts as any);
  useRegle.__config = { rules, modifiers, shortcuts };
  useRules.__config = { rules, modifiers, shortcuts };

  const inferRules = createInferRuleHelper<TCustomRules>();

  return { useRegle, inferRules, useRules };
}

/**
 * Extend an already created custom `useRegle` configuration with additional rules, modifiers, or shortcuts.
 *
 * @param regle - The existing useRegle function to extend
 * @param options - Additional configuration to merge
 * @param options.rules - Additional custom rules
 * @param options.modifiers - Additional modifiers to merge
 * @param options.shortcuts - Additional shortcuts to merge
 * @returns Object containing the extended `useRegle` and `inferRules` functions
 *
 * @example
 * ```ts
 * import { extendRegleConfig } from '@regle/core';
 * import { baseUseRegle } from './base-config';
 *
 * export const { useRegle, inferRules } = extendRegleConfig(baseUseRegle, {
 *   rules: () => ({
 *     additionalRule: myNewRule
 *   }),
 *   modifiers: {
 *     rewardEarly: true
 *   }
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/global-config Documentation}
 */
export function extendRegleConfig<
  TRootCustomRules extends Partial<ExtendedRulesDeclarations>,
  TRootShortcuts extends RegleShortcutDefinition<{}>,
  TShortcuts extends RegleShortcutDefinition<Merge<TRootCustomRules, TCustomRules>>,
  TCustomRules extends Partial<ExtendedRulesDeclarations>,
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
  const newModifiers =
    rootConfig.modifiers && modifiers ? merge(rootConfig.modifiers, modifiers) : (rootConfig.modifiers ?? modifiers);
  const newShortcuts =
    rootConfig.shortcuts && shortcuts ? merge(rootConfig.shortcuts, shortcuts) : (rootConfig.shortcuts ?? shortcuts);

  const useRegle = createUseRegleComposable<TCustomRules, TShortcuts>(newRules, newModifiers, newShortcuts as any);
  useRegle.__config = { rules: newRules, modifiers: newModifiers, shortcuts: newShortcuts as any };

  const inferRules = createInferRuleHelper<TCustomRules>();

  return { useRegle: useRegle as any, inferRules };
}
