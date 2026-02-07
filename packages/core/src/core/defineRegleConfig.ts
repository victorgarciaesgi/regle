import type { Merge } from 'type-fest';
import { merge } from '../../../shared';
import type {
  CustomRulesDeclarationTree,
  ExtendedRulesDeclarations,
  GlobalConfigOverrides,
  RegleBehaviourOptions,
  RegleShortcutDefinition,
} from '../types';
import { createUseRegleComposable, createUseRulesComposable, type useRegleFn, type useRulesFn } from './useRegle';
import { createInferRuleHelper, type inferRulesFn } from './useRegle/inferRules';

export interface GlobalConfigOptions<
  TCustomRules extends Partial<ExtendedRulesDeclarations> = CustomRulesDeclarationTree,
  TShortcuts extends RegleShortcutDefinition<any> = never,
> {
  /**
   * Declare custom rules to be used globally or override the default rules messages.
   *
   * Ex:
   * ```ts
   * import { defineRegleConfig } from '@regle/core';
   * import { required, withMessage } from '@regle/rules';
   *
   * export const { useRegle, inferRules, useRules } = defineRegleConfig({
   *   rules: () => ({
   *     required: withMessage(required, 'This field cannot be empty'),
   *   }),
   * });
   * ```
   * @see {@link https://reglejs.dev/advanced-usage/global-config Documentation}
   */
  rules?: () => TCustomRules;
  /**
   * Define modifiers to be used globally.
   *
   * Ex:
   * ```ts
   * import { defineRegleConfig } from '@regle/core';
   *
   * export const { useRegle, inferRules, useRules } = defineRegleConfig({
   *   modifiers: {
   *     lazy: true,
   *     rewardEarly: true
   *   }
   * });
   * ```
   * @see {@link https://reglejs.dev/advanced-usage/global-config#declare-modifiers Documentation}
   */
  modifiers?: RegleBehaviourOptions;
  /**
   * Define reusable validation shortcuts to be used globally.
   *
   * Ex:
   * ```ts
   * import { defineRegleConfig } from '@regle/core';
   *
   * export const { useRegle, inferRules, useRules } = defineRegleConfig({
   *   shortcuts: {
   *     fields: {
   *       $isRequired: (field) => field.$rules.required?.$active ?? false,
   *     },
   *   },
   * });
   * ```
   * @see {@link https://reglejs.dev/advanced-usage/extend-properties#extend-properties Documentation}
   */
  shortcuts?: TShortcuts;
  /** Override default behaviors of Regle processors. */
  overrides?: GlobalConfigOverrides<unknown>;
}

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
  overrides,
}: GlobalConfigOptions<TCustomRules, TShortcuts>): {
  useRegle: useRegleFn<TCustomRules, TShortcuts>;
  inferRules: inferRulesFn<TCustomRules>;
  useRules: useRulesFn<TCustomRules, TShortcuts>;
} {
  const useRegle = createUseRegleComposable<TCustomRules, TShortcuts>({ rules, modifiers, shortcuts, overrides });
  const useRules = createUseRulesComposable<TCustomRules, TShortcuts>({ rules, modifiers, shortcuts, overrides });
  useRegle.__config = { rules, modifiers, shortcuts, overrides };
  useRules.__config = { rules, modifiers, shortcuts, overrides };

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
  { rules, modifiers, shortcuts, overrides }: GlobalConfigOptions<TCustomRules, TShortcuts>
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
  const newOverrides =
    rootConfig.overrides && overrides ? merge(rootConfig.overrides, overrides) : (rootConfig.overrides ?? overrides);

  const useRegle = createUseRegleComposable<TCustomRules, TShortcuts>({
    rules: newRules,
    modifiers: newModifiers,
    shortcuts: newShortcuts as any,
    overrides: newOverrides,
  });
  useRegle.__config = {
    rules: newRules,
    modifiers: newModifiers,
    shortcuts: newShortcuts as any,
    overrides: newOverrides,
  };

  const inferRules = createInferRuleHelper<TCustomRules>();

  return { useRegle: useRegle as any, inferRules };
}

/**
 * Define a global Regle options to customize the validation behavior across your application.
 * It's meant to be used with the Regle Vue plugin.
 *
 * @param options - Configuration options
 * @returns The configuration options
 *
 * @example
 * ```ts
 * import { defineRegleOptions } from '@regle/core';
 *
 * const regleOptions = defineRegleOptions({
 *   modifiers: {
 *     lazy: true,
 *     rewardEarly: true
 *   }
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/global-config Documentation}
 */
export function defineRegleOptions<T extends GlobalConfigOptions<any, any>>(options: T): T {
  return options;
}
