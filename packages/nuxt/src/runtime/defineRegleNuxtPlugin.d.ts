import type { useCollectScope as defaultUseCollectScope } from '@regle/core';
import {
  type useRegleFn,
  type inferRulesFn,
  type ExtendedRulesDeclarationsOverrides,
  type RegleShortcutDefinition,
} from '@regle/core';

export declare function defineRegleNuxtPlugin<
  TCustomRules extends Partial<ExtendedRulesDeclarationsOverrides>,
  TShortcuts extends RegleShortcutDefinition<any>,
>(
  setup: () => {
    useRegle: useRegleFn<TCustomRules, TShortcuts>;
    inferRules: inferRulesFn<TCustomRules>;
  }
): {
  useRegle: useRegleFn<TCustomRules, TShortcuts>;
  inferRules: inferRulesFn<TCustomRules>;
  useScopedRegle: useRegleFn<TCustomRules, TShortcuts>;
  useCollectScope: typeof defaultUseCollectScope;
};
