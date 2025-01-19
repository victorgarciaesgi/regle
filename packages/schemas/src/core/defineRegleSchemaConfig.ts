import type { RegleBehaviourOptions, RegleShortcutDefinition } from '@regle/core';
import { createUseRegleSchemaComposable, type useRegleSchemaFn } from './useRegleSchema';
import { createInferValibotSchemaHelper, type inferValibotSchemaFn } from './inferSchema';

/**
 * Define a global regle configuration, where you can:
 * - Define global modifiers
 * - Define shortcuts
 *
 * It will return:
 *
 * - a `useValibotRegle` composable that can typecheck your custom rules
 * - an `inferSchema` helper that can typecheck your custom rules
 */
export function defineRegleSchemaConfig<TShortcuts extends RegleShortcutDefinition>({
  modifiers,
  shortcuts,
}: {
  modifiers?: RegleBehaviourOptions;
  shortcuts?: TShortcuts;
}): {
  useValibotRegle: useRegleSchemaFn<TShortcuts>;
  inferSchema: inferValibotSchemaFn;
} {
  const useValibotRegle = createUseRegleSchemaComposable<TShortcuts>(modifiers, shortcuts as any);
  const inferSchema = createInferValibotSchemaHelper();

  return { useValibotRegle, inferSchema };
}
