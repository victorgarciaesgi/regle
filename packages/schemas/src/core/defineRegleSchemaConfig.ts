import type { RegleBehaviourOptions, RegleShortcutDefinition } from '@regle/core';
import { createUseRegleSchemaComposable, type useRegleSchemaFn } from './useRegleSchema';
import { createInferSchemaHelper, type inferSchemaFn } from './inferSchema';

/**
 * Define a global regle configuration, where you can:
 * - Define global modifiers
 * - Define shortcuts
 *
 * It will return:
 *
 * - a `useRegleSchema` composable that can typecheck your custom rules
 * - an `inferSchema` helper that can typecheck your custom rules
 */
export function defineRegleSchemaConfig<TShortcuts extends RegleShortcutDefinition>({
  modifiers,
  shortcuts,
}: {
  modifiers?: RegleBehaviourOptions;
  shortcuts?: TShortcuts;
}): {
  useRegleSchema: useRegleSchemaFn<TShortcuts>;
  inferSchema: inferSchemaFn;
} {
  const useRegleSchema = createUseRegleSchemaComposable<TShortcuts>(modifiers, shortcuts as any);
  const inferSchema = createInferSchemaHelper();

  return { useRegleSchema, inferSchema };
}
