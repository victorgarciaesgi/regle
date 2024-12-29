import type { RegleBehaviourOptions, RegleShortcutDefinition } from '@regle/core';
import { createUseZodRegleComposable, type useZodRegleFn } from './useZodRegle';
import { createInferZodSchemaHelper, type inferZodSchemaFn } from './inferSchema';

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
