import type { GlobalConfigOverrides, RegleBehaviourOptions, RegleShortcutDefinition } from '@regle/core';
import { createUseRegleSchemaComposable, type useRegleSchemaFn } from './useRegleSchema';
import { createInferSchemaHelper, type inferSchemaFn } from './inferSchema';

/**
 * Define a global configuration for `useRegleSchema`.
 *
 * Features:
 * - Define global modifiers (lazy, rewardEarly, etc.)
 * - Define shortcuts for common validation patterns
 *
 * @param options - Configuration options
 * @param options.modifiers - Global behavior modifiers
 * @param options.shortcuts - Reusable validation shortcuts
 * @returns Object containing typed `useRegleSchema` and `inferSchema` functions
 *
 * @example
 * ```ts
 * import { defineRegleSchemaConfig } from '@regle/schemas';
 *
 * export const { useRegleSchema, inferSchema } = defineRegleSchemaConfig({
 *   modifiers: {
 *     lazy: true,
 *     rewardEarly: true
 *   }
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/integrations/schemas-libraries Documentation}
 */
export function defineRegleSchemaConfig<TShortcuts extends RegleShortcutDefinition>({
  modifiers,
  shortcuts,
  overrides,
}: {
  modifiers?: RegleBehaviourOptions;
  shortcuts?: TShortcuts;
  overrides?: GlobalConfigOverrides;
}): {
  useRegleSchema: useRegleSchemaFn<TShortcuts>;
  inferSchema: inferSchemaFn;
} {
  const useRegleSchema = createUseRegleSchemaComposable<TShortcuts>({ options: modifiers, shortcuts, overrides });
  const inferSchema = createInferSchemaHelper();

  return { useRegleSchema, inferSchema };
}
