import { Ref } from 'vue';
import {
  createRule,
  defineType,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
} from '@regle/core';

export function withAsync<TValue, TParams extends (Ref<unknown> | (() => unknown))[]>(
  rule: InlineRuleDeclaration<TValue>,
  depsArray: [...TParams]
): RegleRuleDefinition<TValue> {
  const validator = async (value: any | null | undefined) => {
    return rule(value);
  };

  const newRule = createRule({
    type: defineType<any>(InternalRuleType.Async),
    validator: validator as any,
    message: '',
  });

  newRule._params = depsArray as any;

  return newRule as RegleRuleDefinition;
}
