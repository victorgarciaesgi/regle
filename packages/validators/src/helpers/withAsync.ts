import { Ref } from 'vue';
import {
  createRule,
  defineType,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
} from '@regle/core';

export function withAsync<
  TValue,
  TParams extends (Ref<unknown> | (() => unknown))[],
  TReturn extends TMetadata | Promise<TMetadata>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
>(
  rule: InlineRuleDeclaration<TValue, TReturn>,
  depsArray?: [...TParams]
): RegleRuleDefinition<TValue, TParams, true, TMetadata> {
  const validator = async (value: any | null | undefined) => {
    return rule(value);
  };

  const newRule = createRule({
    type: defineType<any>(InternalRuleType.Async),
    validator: validator as any,
    message: '',
  });

  newRule._params = depsArray as any;

  return newRule as any;
}
