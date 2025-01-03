import type { RegleBehaviourOptions, RegleShortcutDefinition } from '@regle/core';
import { createUseZodRegleComposable, type useZodRegleFn } from './useZodRegle';
import { createInferZodSchemaHelper, type inferZodSchemaFn } from './inferSchema';

/**
 * Define a global regle configuration, where you can:
 * - Define global modifiers
 * - Define shortcuts
 *
 * It will return:
 *
 * - a `useZodRegle` composable that can typecheck your custom rules
 * - an `inferSchema` helper that can typecheck your custom rules
 */
export function defineZodRegleConfig<TShortcuts extends RegleShortcutDefinition>({
  modifiers,
  shortcuts,
}: {
  modifiers?: RegleBehaviourOptions;
  shortcuts?: TShortcuts;
}): {
  useZodRegle: useZodRegleFn<TShortcuts>;
  inferSchema: inferZodSchemaFn;
} {
  const useZodRegle = createUseZodRegleComposable<TShortcuts>(modifiers, shortcuts as any);
  const inferSchema = createInferZodSchemaHelper();

  return { useZodRegle, inferSchema };
}
