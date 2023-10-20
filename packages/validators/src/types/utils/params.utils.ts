import { InlineRuleDeclaration, RegleRuleDefinition } from '@regle/core';

export type ExtractValueFormRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<infer V, any>
    ? [V, ...ExtractValueFormRules<R>]
    : F extends InlineRuleDeclaration<infer V>
    ? [V, ...ExtractValueFormRules<R>]
    : [F, ...ExtractValueFormRules<R>]
  : [];
