import { Ref } from 'vue';
import {
  createRule,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
} from '@regle/core';

export function withAsync<TParams extends (Ref<unknown> | (() => unknown))[]>(
  rule: InlineRuleDeclaration<any>,
  depsArray: [...TParams]
): RegleRuleDefinition<any> {
  const validator = async (value: any | null | undefined) => {
    return rule(value);
  };

  const newRule = createRule({
    type: InternalRuleType.Async,
    validator: validator,
    message: '',
  });

  newRule._params = depsArray as any;

  return newRule as any;
}
