import type {
  AllRulesDeclarations,
  RegleBehaviourOptions,
  RegleShortcutDefinition,
} from '../types';
import { createUseRegleComposable, type useRegleFn } from './useRegle';
import { createInferRuleHelper, type inferRulesFn } from './useRegle/inferRules';

export function defineRegleConfig<
  TCustomRules extends Partial<AllRulesDeclarations>,
  TShortcuts extends RegleShortcutDefinition<TCustomRules>,
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
  const useRegle = createUseRegleComposable<TCustomRules, TShortcuts>(
    rules,
    modifiers,
    shortcuts as any
  );
  const inferRules = createInferRuleHelper<TCustomRules>();

  return { useRegle, inferRules };
}
