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
  TMetadata extends RegleRuleMetadataDefinition,
  TReturn extends TMetadata | Promise<TMetadata>,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: InlineRuleDeclaration<TValue, TReturn, TMetadata, TAsync>,
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
