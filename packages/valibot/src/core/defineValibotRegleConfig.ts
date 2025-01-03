import type { RegleBehaviourOptions, RegleShortcutDefinition } from '@regle/core';
import { createUseValibotRegleComposable, type useValibotRegleFn } from './useValibotRegle';
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
export function defineValibotRegleConfig<TShortcuts extends RegleShortcutDefinition>({
  modifiers,
  shortcuts,
}: {
  modifiers?: RegleBehaviourOptions;
  shortcuts?: TShortcuts;
}): {
  useValibotRegle: useValibotRegleFn<TShortcuts>;
  inferSchema: inferValibotSchemaFn;
} {
  const useValibotRegle = createUseValibotRegleComposable<TShortcuts>(modifiers, shortcuts as any);
  const inferSchema = createInferValibotSchemaHelper();

  return { useValibotRegle, inferSchema };
}
