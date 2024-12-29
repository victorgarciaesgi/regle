import type { RegleBehaviourOptions, RegleShortcutDefinition } from '@regle/core';
import { createUseValibotRegleComposable, type useValibotRegleFn } from './useValibotRegle';
import { createInferValibotSchemaHelper, type inferValibotSchemaFn } from './inferSchema';

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
